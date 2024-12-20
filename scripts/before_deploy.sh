# ./scripts/before_deploy.sh


# 어디서 commend를 실행할 건지
REPOSITORY=/home/ubuntu
cd $REPOSITORY

# pm2 진행되는 것 전체 삭제
pm2 kill