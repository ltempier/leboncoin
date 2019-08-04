echo "****** PUSH TO GIT ******"
git commit -am 'from deploy.sh'
git push

echo "****** STOP DOCKER ******"
ssh ltr@server docker-compose -f /home/ltr/git/DockerCompose/docker-compose.yml stop leboncoin

echo "****** PULL FROM GIT ******"
ssh ltr@server git -C "/home/ltr/git/leboncoin" fetch
ssh ltr@server git -C "/home/ltr/git/leboncoin" stash
ssh ltr@server git -C "/home/ltr/git/leboncoin" pull --rebase

echo "****** NPM INSTALL ******"
ssh ltr@server docker-compose -f /home/ltr/git/DockerCompose/docker-compose.yml run --rm leboncoin npm install

sleep 3

echo "****** START DOCKER ******"
ssh ltr@server docker-compose -f /home/ltr/git/DockerCompose/docker-compose.yml up -d leboncoin
