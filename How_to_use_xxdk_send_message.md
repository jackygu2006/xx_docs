# 使用xxDK在xxnetwork上发送/接受隐私消息

### 环境：
golang >1.13

最好在有公网IP的设备上跑。

### 安装
```
git clone https://gitlab.com/elixxir/client.git client
cd client
go mod vendor -v
go mod tidy
go test ./...

# 根据操作系统，选择性安装
# Linux 64 bit binary
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '-w -s' -o client main.go
# Windows 64 bit binary
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '-w -s' -o client main.go
# Windows 32 big binary
GOOS=windows GOARCH=386 CGO_ENABLED=0 go build -ldflags '-w -s' -o client.exe main.go
# Mac OSX 64 bit binary (intel)
GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -ldflags '-w -s' -o client main.go

cp client /usr/local/bin
```
完成以上步骤后，会在当前目录中找到安装好的名为`client`的软件。

使用命令`./client help`，查看帮助。


### 生成客户端证书
```
openssl s_client -showcerts -connect *.*.*.*:22840 < /dev/null 2>&1 | openssl x509 -outform PEM > certfile.pem
```
*.*.*.*是`gateway`的节点IP，一般默认安装的话，`gateway`的端口号为`22840`。
以上命令执行后，在当前目录下会生成一个证书文件：`certfile.pem`。

### 获得NDF
NDF是每个客户端的`ID`，以`json`格式存在文件中。

```
client getndf --gwhost *.*.*.*:22840 --cert certfile.pem | jq . | head
```

显示结果类似如下：
```
{
  "Timestamp": "2021-11-02T20:36:56.013151939Z",
  "Gateways": [
    {
      "Id": "6ZTH8Y01DHrRFahBtLjF4uRTPed/JuM1R12lr2A2hv0B",
      "Address": "161.35.228.41:22840",
      "Tls_certificate": "-----BEGIN CERTIFICATE-----\nMIIFuzC......aoxvs7RU6CR5TFbwwAkNiMSYhs3NuZlm\nMg6k4jkhZSEk/P7oD5/ddAw==\n-----END CERTIFICATE-----\n",
      "Bin": "NorthAmerica"
    },
    {
```

注意：必须使用`gateway`节点，即`--gwhost [节点IP:端口号]`。

如果自己没有建`gateway`节点，需要问朋友要一个`gateway`的节点IP列表。

通过以下命令获取完整`ndf.json`文件
```
client getndf --gwhost 35.200.211.94:22840 --cert certfile.pem > ndf.json
```

### 给自己发送测试消息：
```
client --password 1234567 --ndf ndf.json -l client.log -s sessions --writeContact user-contact.json --unsafe -m "Hello World, without E2E Encryption"
```
以上`1234567`是自定义密码，`sessions`是对话保留的目录。


### 不同用户间发送消息
设置消息监听（用`&`以进程方式在后台运行）：
```
client --password user1234567 --ndf ndf.json -l client1.log -s user1session --destfile user2-contact.json --unsafe -m "Hi User 2, from User 1 without E2E Encryption" &

client --password user2345678 --ndf ndf.json -l client2.log -s user2session --destfile user1-contact.json --unsafe -m "Hi User 1, from User 2 without E2E Encryption" &
```

相互发送消息：
```
client --password user1234567 --ndf ndf.json -l client1.log -s user1session --writeContact user1-contact.json --unsafe -m "Hi1"

client --password user2345678 --ndf ndf.json -l client2.log -s user2session --writeContact user2-contact.json --unsafe -m "Hi2"
```
说明：
`--destfile` is used to specify the recipient. You can also use
`--destid b64:...` using the user's base64 id which is printed in the logs.

### 不同用户间发送加密消息
```
# Get user contact jsons
client --password user1234567 --ndf ndf.json -l client1.log -s user1session --writeContact user1-contact.json --unsafe -m "Hi"
client --password user2345678 --ndf ndf.json -l client2.log -s user2session --writeContact user2-contact.json --unsafe -m "Hi"

# Send E2E Messages
client --password user1234567 --ndf ndf.json -l client1.log -s user1session --destfile user1-contact.json --unsafe-channel-creation -m "Hi User 2, from User 1 with E2E Encryption" &
client --password user2345678 --ndf ndf.json -l client2.log -s user2session --destfile user1-contact.json --unsafe-channel-creation -m "Hi User 1, from User 2 with E2E Encryption" &
```

与上面例子不通的在于，用`--unsafe-channel-creation`取代了`--unsafe`

<未完>