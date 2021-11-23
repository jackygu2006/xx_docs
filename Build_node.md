[返回目录](README.md)

![](https://tva1.sinaimg.cn/large/008i3skNgy1gw4radawnyj319g0kun0g.jpg)
**说明：本教程针对熟悉Linux服务器操作的技术人员，将官方发布的xxnetwrok节点的安装说明做了精简，去掉了大量的常识性操作说明。**

非专业人员，或者对Linux服务器不熟悉的技术人员，请查看英文版的详细操作手册：https://xxnetwork.wiki/index.php/Operating_System_Installation_and_Configuration

---

# 第一部分：环境配置
## 1. 硬件要求
一个节点由两台服务器组成，其中一台称为`cMix Node`(简称`Node`)，另一台称为网关`Gateway`。

硬件要求详见：https://xxnetwork.wiki/index.php/Hardware_Requirements

### 1.1 cMix Node硬件要求
![](https://tva1.sinaimg.cn/large/008i3skNgy1gw4rcmxr5aj318i0s2wiz.jpg)

### 1.2 Gateway硬件要求
![](https://tva1.sinaimg.cn/large/008i3skNgy1gw4rdp2g7wj30vu0jyq5k.jpg)

## 2. 软件环境
### 2.1 操作系统
![](https://tva1.sinaimg.cn/large/008i3skNgy1gw4rbq5w9aj308904qmx5.jpg)

Ubuntu Server 20.04

### 2.2 网络要求
网络连通性要极佳，延迟极小。

同时需要有固定IP。

### 2.3 安装Python3和对应版本的pip
```
sudo apt install -y python3-pip
sudo pip3 install -U pip // 更新python库，可以省略
```

安装py支持包
```
pip3 install --user -U boto3 pyOpenSSL substrate-interface packaging requests
```

## 3. 配置端口
### 3.1 默认端口
* `cMix Node`端口：`11420`
* `Gateway`端口：`22840`
* `xx chain`端口：`15974`


### 3.2 防火墙开启上述端口
```
sudo ufw disable
sudo ufw allow 15974/tcp comment "xx chain"
sudo ufw allow 11420/tcp comment "xx network cMix"
sudo ufw allow 22840/tcp comment "xx network Gateway"
sudo ufw enable
```
如果使用云主机，请在云控制台中设置防火墙。

如果`Node`和`Gateway`分别在不同服务器上的话，开启对应的端口。

## 4. 配置用户上限
```
sudo nano /etc/security/limits.conf
```
在配置文件中添加以下内容：
```
*  soft    nofile   unlimited
*  hard    nofile   unlimited
*  soft    nproc    unlimited
*  hard    nproc    unlimited

# End of file
```

## 5. 配置GPU
注意，`GPU`仅限于`cMix Node`，`Gateway`不需要。

执行一下指令：
```
sudo apt install -y nvidia-driver-470-server
sudo systemctl set-default multi-user.target
sudo shutdown -r now // 重启服务器，让配置生效
sudo lshw -c display // 验证GPU是否正常安装
nvidia-smi // 查看GPU参数
```

-----

# 第二部分 cMix Node安装与配置
## 1. 下载`xxnetwork`的`cmix node`安装包
```
cd /opt/
sudo curl -L -O https://xx.network/protonet-node.tar.gz
sudo tar -xvf protonet-node.tar.gz
cd xxnetwork
sudo chmod +x /opt/xxnetwork/bin/*
```

## 2. 配置证书
```
python3 generate-certs.py
```
执行上述指令后，在目录`cred`目录下，会生成证书文件和`.IDF`文件。

将`cred`目录以及目录下所有文件传到本地电脑，这些证书将用于`Gateway`的配置。

注：可以使用`scp`在服务器和本地电脑之间进行文件传输，如使用：
```
scp -r [Node username]@[Node public IP]:/opt/xxnetwork/cred/ cred/
```
可以将服务器上文件下载到本地电脑。

最后，为确保安全，将服务器上的`cred/gateway-key.key`私钥文件删除。

*注：cred目录下的所有文件请务必妥善保管*

## 3. 配置`./config/cmix.yaml`
如果使用默认配置，并且使用`GPU`，则一般不用更改该配置文件。

如果不用GPU，则将配置文件中的`useGPU`改为`false`。

如果证书文件不在默认安装位置，也请调整相应目录。

如果需要改端口，也在这个配置里改。注意如果端口改了，请调整相应端口的防火墙策略。

## 4. 配置`xxnetwork-cmix.service`
打开配置文件，将`User`改为服务器的用户帐号。

## 5. 配置`xxnetwork-chain.service`
打开配置文件，将`User`改为服务器的用户帐号。

另外，在`ExecStart`执行命令的参数`--validator`后面，加上`--name 节点名称`，如：
```
ExecStart=/bin/bash -c "/opt/xxnetwork/bin/xxnetwork-chain --validator --name 自己定一个节点名称 --telemetry-url 'wss://telemetr
y.polkadot.io/submit/ 0' --base-path /opt/xxnetwork/db --port 15974 --ws-port 63007  >> /opt/xxnetwork/log/chain.log 
2>&1"    
```

## 6. 配置数据库
### 6.1 安装并运行`PostgreSQL`
```
sudo apt install -y postgresql-client postgresql postgresql-contrib

sudo update-rc.d postgresql enable

sudo service postgresql start
```

### 6.2 创建名为`cmix`的数据库用户
```
sudo -u postgres createuser --createdb --pwprompt cmix
```
创建时需要输入该用户的密码。

### 6.3 创建名为`cmix_node`的数据库
```
sudo -u postgres createdb -O cmix cmix_node
```

### 6.4 编辑`./config/cmix.yaml`
将`database`的`password`一项改为`5.2`步设定的密码。如果上述步骤中改了数据库用户名或数据库名，也在相应配置中调整。

### 6.5 验证数据库是否正确配置
```
sudo su postgres
psql            // 进入postgreSQL
\l              // 显示数据表，看看是否有cmix_node表
\q              // 推出postgreSQL
exit
```

## 7. 启动xxnetwork的cMix Node服务
注意，启动服务前，需要确保工作目录的own为当前服务器用户名，执行：
```
sudo chown [user]:[user] -Rv /opt/xxnetwork
```

### 7.1 给`cmix`和`xxchain`建立软链接
```
sudo ln -s /opt/xxnetwork/xxnetwork-cmix.service /etc/systemd/system

sudo ln -s /opt/xxnetwork/xxnetwork-chain.service /etc/systemd/system

sudo systemctl daemon-reexec
```

### 7.2 激活`cmix`和`xxchain`服务
```
sudo systemctl enable xxnetwork-cmix.service

sudo systemctl enable xxnetwork-chain.service
```

### 7.3 启动`cmix`和`xxchain`服务
```
sudo systemctl start xxnetwork-chain.service

sudo systemctl start xxnetwork-cmix.service
```
以上命令执行后，两个程序将在后台运行。

### 7.4 查看服务运行状态
```
sudo systemctl status xxnetwork-cmix.service

sudo systemctl status xxnetwork-chain.service
```
### 7.5 查看进程
```
ps -A | grep xxnetwork
```
如果显示进程
```
 ?        00:00:12 xxnetwork-chain     
```
则说明`cMix Node`已经正常运行

*注意：这时xxnetwork-cmix并没有完全启动，这时候，需要在完成第三部分后进行初始质押，然后才能看到xxnetwork-cmix服务启动，接着gateway才能连上cmix node，节点开始工作*

----------------------------------------------------------------

# 第三部分 Gateway安装与配置
## 1. 下载`xxnetwork`的`Gateway`软件包
```
cd /opt/
sudo curl -L -O https://xx.network/protonet-gateway.tar.gz
sudo tar -xvf protonet-gateway.tar.gz
cd xxnetwork
sudo chmod +x /opt/xxnetwork/bin/*
```

## 2. 将安装node时生成的证书和私钥复制到`Gateway`节点
需要复制的有以下三个文件到`Gateway`的`cred`目录下：
```
gateway-cert.crt
gateway-cert.key
cmix-cert.crt
```

同样的，使用`scp`工具，命令如下：
```
scp cred/gateway-cert.crt cred/gateway-key.key cred/cmix-cert.crt [Gateway username]@[Gateway public IP]:/opt/xxnetwork/cred/
```

## 3. 配置`gateway.yaml`
编辑`config/gateway.yaml`，在`cmixAddress: "[Node IP]:11420"`中配置Node IP地址。其他保持默认。


## 4. 配置`xxnetwork-gateway.service`和`xxnetwork-chain.service`
同配置`cMix Node`相同，即将两个文件中的`User`都设置为服务器用户名。

另外，在`xxnetwork-chain.service`中，将`ExecStart`的参数中添加`--name`，参考如下：
```
ExecStart=/bin/bash -c "/opt/xxnetwork/bin/xxnetwork-chain --light --name [自定义一个名字] --telemetry-url 'wss://tele
metry.polkadot.io/submit/ 0' --base-path /opt/xxnetwork/db --port 15974 --ws-port 63007  >> /opt/xxnetwork/log/chain.
log 2>&1" 
```

## 5. 配置数据库
### 5.1 安装并运行`PostgreSQL`
```
sudo apt install -y postgresql-client postgresql postgresql-contrib
sudo update-rc.d postgresql enable
sudo service postgresql start
```

### 5.2 创建名为`cmix`的用户
```
sudo -u postgres createuser --createdb --pwprompt cmix
```
创建时需要输入该用户的密码。

### 5.3 创建名为`cmix_gateway`的数据库
```
sudo -u postgres createdb -O cmix cmix_gateway
```

### 5.4 更新数据库密码
再次编辑`./config/gateway.yaml`，将`database`的`password`一项改为设定的密码。如果上述步骤中改了数据库用户名或数据库名，也在相应配置中调整。

### 5.5 验证数据库是否正确配置
```
sudo su postgres
psql            // 进入postgreSQL
\l              // 显示数据表，看看是否有cmix_node表
\q              // 推出postgreSQL
exit
```

## 6. 启动xxnetwork服务
与配置`Node`一样，启动服务前，需要确保工作目录的own为当前服务器用户名，执行：
```
sudo chown [user]:[user] -Rv /opt/xxnetwork
```

### 6.1 给`gateway`和`xxchain`建立软链接
```
sudo ln -s /opt/xxnetwork/xxnetwork-gateway.service /etc/systemd/system
sudo ln -s /opt/xxnetwork/xxnetwork-chain.service /etc/systemd/system
sudo systemctl daemon-reexec
```

### 6.2 激活`gateway`和`xxchain`服务
```
sudo systemctl enable xxnetwork-gateway.service
sudo systemctl enable xxnetwork-chain.service
```

### 6.3 启动`gateway`和`xxchain`服务
```
sudo systemctl start xxnetwork-gateway.service
sudo systemctl start xxnetwork-chain.service
```
以上命令执行后，两个程序将在后台运行。

### 6.4 查看服务运行状态
```
sudo systemctl status xxnetwork-gateway.service
sudo systemctl status xxnetwork-chain.service
```

### 6.5 查看进程
```
ps -A | grep xxnetwork
```
应该可以看到两个相关进程
```
~~~~~ ?        00:00:12 xxnetwork-chain
~~~~~ ?        00:00:18 xxnetwork-gatew
```

如果看不到`xxnetwork-gatew`，说明`gateway`还没启动，稍等，或者查看`log/gateway_wrapper.log`找到原因。

--------------------------------

# 第四部分 质押节点
节点要有质押收益，必须成为验证人节点。

### 1. 确认节点运行状态良好
进入`cMix Node`节点，执行`cat /opt/xxnetwork/log/chain.log | grep Syncing`，查看并确认链是否正常运行。

执行`tail -2 /opt/xxnetwork/log/cmix-wrapper.log`，查看节点同步与共识情况，如果显示：
```
[INFO] 09-Jul-21 16:25:07: Waiting on IDF for consensus...
[INFO] 09-Jul-21 16:25:07: Waiting on consensus ready state...
```
则继续下一步。

*注意：这时`cMix Node`其实尚未真正启动，需要完成质押后才启动*

### 2. 获得`session key`
执行以下`curl`指令：
```
curl -H "Content-Type: application/json" \
-d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
http://localhost:9933 -o /opt/xxnetwork/cred/session-keys.json
```
这时，会在`cred`目录下生成一个新的文件`session-keys.json`。

打开该文件，`result`就是需要绑定的`session key`，同时在`/opt/xxnetwork/db/chain/xxnetwork/keystore`目录下，会生成四个文件。

### 注意：
> 上述`curl`命令只能执行一次，如果需要再次执行，需要将`/opt/xxnetwork/db/chain/xxnetwork/keystore`目录下清空，否则会在该`keystore`目录下又产生四个文件，从而导致节点创建失败。

### 3. 获得cmix ID
打开`cred`目录下的`cmix-IDF.json`，`hexNodeID`就是`cmix ID`

----------------------------------------------------------------

# 第五部分 绑定节点账户
至此，您已经获得了`session key`和`cmix ID`。接下去，需要在浏览器中打开xx network浏览器网页版，将节点与账户绑定。

相关教程，请[点击这里](/Connect_node_with_validator_account.md)

