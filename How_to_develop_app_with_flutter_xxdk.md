## 原理
主程序`main.dart`调用 => 插件(Plugin) => `kotlin/java`调用 => gomobile打包`aar`库


## 第一步 用`gomobile`编译`client`
新建一个工作文件夹，执行以下步骤
```
# Go mobile install
go get -u golang.org/x/mobile/cmd/gomobile
go get -u golang.org/x/mobile/bind
gomobile init... # Note this line will be different depending on sdk/target!

# Get and client test code
git clone https://gitlab.com/elixxir/client.git client
cd client
go mod vendor -v
go mod tidy
go test ./...

# Android
gomobile bind -target android -androidapi 21 gitlab.com/elixxir/client/bindings

# iOS
gomobile bind -target ios gitlab.com/elixxir/client/bindings
zip -r iOS.zip Bindings.framework
```
以Android为例，这时候会生成以下两个文件：
```
bindings.aar
bindings-sources.jar
```

## 第二步 新建`Flutter`插件
### 1. 安装支持库
首先，安装`Flutter`，具体方案请自行查找。

其次，在`Android Studio`中安装好`flutter`和`dart`插件，安装方式：选择菜单`Preferances->Plugins`，在搜索中查找`Flutter`以及`dart`并安装，重启。

### 2. 新建Flutter插件（Plugin）
选择菜单`File->New->New Flutter Project...`，输入`Flutter`的SDK路径，选择下一步，输入项目名称，路径，组织等，注意：在`Project type`中，选择`Plugin`，同时选择`android`和`ios`平台。点击确认，自动生成程序框架。

## 第三步 为插件边写调用代码
### 1. 复制`bindings`库
将第一步中生成的`bindings.arr`和`bindings-sources.jar`两个文件复制到`Flutter`项目的`android`目录下的`libs`（libs为新建的目录，专门用来存放用户库）

### 2. 修改`build.gradle`
打开`andoird`目录下的`build.gradle`，在`dependencies`中增加一行
```
     implementation files('libs/bindings.aar')
```

### 3. 编写`kotlin`代码
作用：通过`kotlin`调用`aar`库中的函数。

打开文件：`android/src/main/kotlin`目录下`XXPlugin.kt`，在导入包的部分加入：
```
import bindings.Client
import bindings.Message
... 根据需要导入更多
```

修改`onMethodCall`方法，定义调用命令。此处工作量较大，需要将`xxDK`的大多数命令全部改写成`kotlin`的调用。

如：
```
    when (call.method) {
      "getPlatformVersion" -> {
        result.success("Android ${android.os.Build.VERSION.RELEASE}")
      }
      "test" -> {
        val args = call.arguments
        result.success("Hello");
      }
      "方法" => {
        ...
      }
      ...
    }

```

### 4. 编写`Plugin`调用代码
在`lib`目录中，为`dart`的插件增加方法，所有方法需要与上述用`kotlin`定义的方法对应。

方法格式如下：
```
  static Future<String> test(String str) async {
    final String dat = await _channel.invokeMethod('test', str);
    return dat;
  }
```
至此，插件`Plugin`全部完成，可以打包输出给其他程序使用，或者直接在当前程序中使用。

## 第四步 在`Fluter`的`example/lib/main.dart`中试调用Plugin

## 第五步 一个类似微信的聊天框架

## 第六步 将通讯接口换成xxDK

## 第七步 编程与调试

