# PM2实现Nodejs项目自动部署


    思路：本地git仓库与远程仓库关联（github、码云等平台），然后pm2按照指定配置登录服务器，拉取远程仓库的代码更新，再执行一些指定的命令（如打包等）。
    
  
## 1. 环境搭建
#### 安装pm2
```
npm install pm2@latest -g
```
#### 官网文档：http://pm2.keymetrics.io/docs/usage/deployment/


## 2. 创建本地项目并关联到远程仓库
    
#### 1. 创建本地仓库
` git init`
#### 2. 创建文件
```
let express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));


var proxy = require('http-proxy-middleware');

app.use('/ajax', proxy({
    target: "http://m.maoyan.com/",
    changeOrigin: true
}));

app.listen(3000,function(){
    console.log('server start@127.0.0.1:3000')
})
```
使用 `app.use(express.static(path.join(__dirname, 'public')));`
把public木作为静态文件目录

#### 3. 在github上创建远程仓库

创建好的仓库地址：
```
git@github.com:cooleye/daviesite.git
```
#### 4. 和远程仓库关联

```
git remote add origin git@github.com:cooleye/daviesite.git
```

## 3.项目中配置pm2自动部署文件

```
pm2 ecosystem
```
运行命令的当前目录下会生成一个ecosystem.json 文件
编辑ecosystem.json：
```
{
    "apps":[
        {
            "name": "daviesite", 
            "script": "index.js", 
            "env": {
                "COMMON_VARIABLE": "true"
            },
            "env_production": {
                "NODE_ENV": "production" 
            }
        }
    ],
    "deploy": {
        "production": {
            "user":"root",
            "host": ["47.108.78.24"],
            "port": "22",
            "ref": "origin/master",
            "repo": "git@github.com:cooleye/daviesite.git",
            "path": "/mnt/daviesite",
            "ssh_options": "StrictHostKeyChecking=no",
            "pre-setup": "echo 'This is a pre-setup command'",
            "post-setup": "ls -la",
            "pre-deploy-local": "echo 'This is a pre-deploy-local command'",
            "post-deploy" : "npm install && pm2 start 0"
        }
    }
}
```

#### 解析配置文件
- user :登录用户名
- host : 要部署的目标服务器或者域名
- ref : 用于部署代码时的分支
- repo : git 仓库地址
- path : 在目标服务器上部署的文件目录地址
- post-deploy : 部署后启动的脚本

## 4. 配置服务器环境
#### 1. 在服务器上也要安装pm2
```
npm install pm2@latest -g
```
#### 2. ssh 公钥和私钥
在服务器端生成 ssh公钥和私钥
```
ssh-keygen -t rsa -C "youremail"
```
#### 3. 查看公钥：
```
cat ~/.ssh/id_rsa.pub
```
#### 4. 把公钥添加到github上

#### 5. 将来文件会上传到 `/mnt/daviesite`目录上，查看是否有写入的权限，没有的话需要添加写入权限


## 5. 部署
#### 1. 把本地代码推送到github上
```
git add .
git commit -m 'update'
git push origin master
```
#### 2. 设置免密登录
```
 scp ~/.ssh/id_rsa.pub root@47.98.154.75:/root/.ssh/authorized_keys
```
#### 3. 在远程安装部署
```
pm2 deploy ecosystem.json production setup
```
执行这一步，服务器会会github上clone代码下来，并使用pm2运行
#### 4. 部署
```
pm2 deploy ecosystem.json production
```
执行这一步，服务器会依照 package.json 安装依赖
#### 5. 更新
```
pm2 deploy production update
```
更新代码


