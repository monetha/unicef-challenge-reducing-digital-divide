#!/bin/bash

set -e -o pipefail

if [ -z "$AWS_ACCESS_KEY_ID" ]
  then
    echo "No AWS_ACCESS_KEY_ID supplied."
    exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]
  then
    echo "No AWS_SECRET_ACCESS_KEY supplied."
    exit 1
fi

if [ -z "$AWS_DEFAULT_REGION" ]
  then
    echo "No AWS_DEFAULT_REGION supplied."
    exit 1
fi

if [ -z "$AWS_IAM_ROLE_ARN" ]
  then
    echo "No AWS_IAM_ROLE_ARN supplied."
    exit 1
fi

if [ -z "$AWS_S3_BUCKET_NAME" ]
  then
    echo "No AWS_S3_BUCKET_NAME supplied."
    exit 1
fi

if [ -z "$AWS_CF_CDN_ID" ]
  then
    echo "No AWS_CF_CDN_ID supplied."
    exit 1
fi

SOURCE_DIR=$1

source <(aws sts assume-role --role-arn $AWS_IAM_ROLE_ARN --role-session-name deploy-to-S3-$AWS_S3_BUCKET_NAME | jq -r '.Credentials | @sh "export AWS_SESSION_TOKEN=\(.SessionToken)\nexport AWS_ACCESS_KEY_ID=\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\(.SecretAccessKey)"')
echo "Deploying to AWS S3 bucket $AWS_S3_BUCKET_NAME"
aws s3 sync $SOURCE_DIR s3://$AWS_S3_BUCKET_NAME --exclude "*.html" --cache-control "public, max-age=604800" --only-show-errors
aws s3 sync $SOURCE_DIR s3://$AWS_S3_BUCKET_NAME --exclude "*" --include "*.html" --cache-control "public, no-cache, must-revalidate, proxy-revalidate, max-age=0" --only-show-errors
aws s3 sync $SOURCE_DIR s3://$AWS_S3_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id $AWS_CF_CDN_ID --paths '/*'
