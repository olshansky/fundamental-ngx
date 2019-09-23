#!/usr/bin/env bash

set -u -e

git config --global user.email "fundamental@sap.com"
git config --global user.name "fundamental-bot"

PACKAGES=(core platform)
CURRENT_BRANCH=master

echo $ARCHIVE_BRANCH

if [[ $TRAVIS_BUILD_STAGE_NAME == "Release" ]]; then
   echo "################ Running Master deploy tasks ################"
   CURRENT_BRANCH=master

  # delete temp branch
  git push "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG" ":$TRAVIS_BRANCH" > /dev/null 2>&1;
  std_ver=$(npm run std-version)
  release_tag=$(echo "$std_ver" | grep "tagging release" | awk '{print $4}')
  echo "New release version: $std_ver"

elif [ $TRAVIS_BUILD_STAGE_NAME == "Archive-Release" ]; then
  echo "################ Running ${ARCHIVE_BRANCH} deploy tasks ################"
  CURRENT_BRANCH=$ARCHIVE_BRANCH

  # delete temp branch
  git push "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG" ":$TRAVIS_BRANCH" > /dev/null 2>&1;
  std_ver=$(npm run std-version)
  release_tag=$(echo "$std_ver" | grep "tagging release" | awk '{print $4}')
  echo "New release version: $std_ver"


elif [[ $TRAVIS_BUILD_STAGE_NAME == "Pre-release" || $TRAVIS_BUILD_STAGE_NAME == "Archive-pre-release" ]]; then
   echo "################ Running RC deploy tasks ################"

   CURRENT_BRANCH=${TRAVIS_BRANCH}
   npm run std-version -- --prerelease rc --no-verify

else
    echo  "${TRAVIS_BUILD_STAGE_NAME}"
   echo "Missing required stage name"
   exit 1
fi


git push --follow-tags "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG" $CURRENT_BRANCH > /dev/null 2>&1;
npm run build-deploy-library



cd dist/libs
NPM_BIN="$(which npm)"

for P in ${PACKAGES[@]};
do
    echo publish "@fundamental-ngx/${P}"
    cd ${P}
#    $NPM_BIN  publish --access public
    echo Published
    cd ..
done

cd ../../


if [[ $TRAVIS_BUILD_STAGE_NAME =~ "Release" ]]; then

    npm run release:create -- --repo $TRAVIS_REPO_SLUG --tag $release_tag --branch master
    npm run build-docs
    npm run deploy-docs -- --repo "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG"
elif [[ $TRAVIS_BUILD_STAGE_NAME == "Archive-Release" ]]; then

    npm run release:create -- --repo $TRAVIS_REPO_SLUG --tag $release_tag --branch $ARCHIVE_BRANCH
    npm run build-docs
    npm run deploy-docs -- --repo "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG"
fi


if [ ${args[0]} == $ARCHIVE_BRANCH ]; then
    echo "Run after publish to make sure GitHub finishes updating from the push"
fi

