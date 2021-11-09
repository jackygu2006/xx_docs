[返回目录](README.md)

# 第五部分 绑定节点账户

接上文，经过[之前四步操作](/Build_node.md)，您已经获得了`session key`和`cmix ID`。

## 1.生成帐户

在为您的节点设置抵押之前，您需要生成存储（stash）和控制器（controller）两个独立帐户。
这两个账户的生成可采用中国社区开发的xxWallet（安卓版下载：https://xxnetwork.asia/download/，苹果版即将上架）

（对于每个账户，将生成一个标准助记词，一个量子安全助记词。需要将两套助记词保存在安全可靠的地方。）

注意：千万不要使用已经为其他节点提供过质押的老钱包地址。

两个钱包地址建好后，开始下一步。

## 2.绑定和验证

下面的说明描述了如何使用[xx 网络资源管理](https://explorer.xx.network/)抵押您的节点并成为验证人。这里需要打开您的电脑使用 Web 浏览器进行操作。

### 添加帐户

您在xxWallet创建的2个帐户，需确保有足够的资金来支付交易费用（最少5000个ptc）。您需要将大部分资金保留在stash 账户中，因为它是您的 staking 资金的保管人。

要将您的帐户添加到 xx 资源管理器，请按照以下说明操作

1. 在浏览器中转到[https://explorer.xx.network/#/accounts](https://explorer.xx.network/#/accounts)。
2. 在“*帐户”页面*的右侧，单击“*添加帐户”*按钮![xx 网络浏览器添加帐户页面上的添加帐户按钮图片。](https://xxnetwork.wiki/images/thumb/b/b3/Explorer_Add_account_button.svg/112px-Explorer_Add_account_button.svg.png)。
   [![xx 网络资源管理器帐户页面的屏幕截图，红色箭头指向添加帐户按钮。](https://xxnetwork.wiki/images/7/71/Xx_network_Explorer-_Account_Page.png)](https://xxnetwork.wiki/index.php/File:Xx_network_Explorer-_Account_Page.png)
3. 将*通过助记词添加帐户*页面会显示出来。输入stash 账户的标准助记词
   [![通过资源管理器中的种子窗口添加帐户的上半部分。](https://xxnetwork.wiki/images/a/ae/Add_an_Account_Via_Seed_-_Enter_Mnemonic_Seed_%28Top%29.png)](https://xxnetwork.wiki/index.php/File:Add_an_Account_Via_Seed_-_Enter_Mnemonic_Seed_(Top).png)
4. 然后选中*我已安全保存助记词种子*复选框。
   [![我已经安全地保存了我的助记词种子复选框。](https://xxnetwork.wiki/images/c/c4/Add_an_Account_Via_Seed_-_Checkbox.png)](https://xxnetwork.wiki/index.php/File:Add_an_Account_Via_Seed_-_Checkbox.png)
   
   在您保存钱包助记词之前，请勿进行下一步。
5. 单击*下一步*按钮![下一个按钮.svg](https://xxnetwork.wiki/images/thumb/d/d6/Next_Button.svg/63px-Next_Button.svg.png)。
   [![通过种子添加帐户 - Next Button.png](https://xxnetwork.wiki/images/3/33/Add_an_Account_Via_Seed_-_Next_Button.png)](https://xxnetwork.wiki/index.php/File:Add_an_Account_Via_Seed_-_Next_Button.png)
6. 接下来，您需要输入帐户详细信息。
   
   1. 为您的存储帐户创建名称，为了方便，名称设置请区分 stash 和controller帐户。
   2. 创建一个强大而安全的密码。
   3. 单击*下一步*按钮![下一个按钮.svg](https://xxnetwork.wiki/images/thumb/d/d6/Next_Button.svg/63px-Next_Button.svg.png)。
   
   [![通过种子窗口输入有关添加帐户的帐户详细信息。](https://xxnetwork.wiki/images/d/de/Add_an_Account_Via_Seed_-_Account_details.png)](https://xxnetwork.wiki/index.php/File:Add_an_Account_Via_Seed_-_Account_details.png)
7. 在下一页上，您将看到一个包含您的帐户信息的文件。单击“*保存”*按钮![资源管理器保存按钮.svg](https://xxnetwork.wiki/images/thumb/0/02/Explorer_Save_button.svg/62px-Explorer_Save_button.svg.png)下载此文件。
   [![通过种子窗口添加帐户的保存按钮。](https://xxnetwork.wiki/images/1/14/Add_an_Account_Via_Seed_-_Save.png)](https://xxnetwork.wiki/index.php/File:Add_an_Account_Via_Seed_-_Save.png)
   
   在将此文件保存到安全可靠的位置之前，请勿继续下一步。

### 3.设置验证器

1. 在导航菜单中，转到*Network*并单击*Staking*。或者导航到[https://explorer.xx.network/#/staking](https://explorer.xx.network/#/staking)。
   [![导航中的放样按钮。](https://xxnetwork.wiki/images/0/08/Explorer_-_Staking_Nav.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Staking_Nav.png)
2. 接下来，单击子菜单中的*帐户操作*。然后单击*验证器*按钮![帐户操作页面上的验证器按钮。](https://xxnetwork.wiki/images/thumb/9/97/Explorer_Validator_button.svg/90px-Explorer_Validator_button.svg.png)。
   [![单击帐户操作，然后添加验证器。](https://xxnetwork.wiki/images/9/9f/Explorer_-_Account_Actions%2C_Add_Validator.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Account_Actions,_Add_Validator.png)
3. *设置验证*窗口将打开。
   
   a. 从下拉菜单中选择您的**存储**帐户。确保右侧显示的地址与您的**stash**帐户钱包地址匹配。
   b. 从下拉菜单中选择您的**控制器**帐户。确保右侧显示的地址与您的**控制器**帐户钱包地址匹配。
   c. 输入保证金金额。它必须至少为 5000。
   d. 然后，单击*下一步*按钮![下一个按钮.svg](https://xxnetwork.wiki/images/thumb/d/d6/Next_Button.svg/63px-Next_Button.svg.png)。
   
   [![设置验证器窗口。](https://xxnetwork.wiki/images/0/0a/Explorer_-_Setup_Validator_1-2.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Setup_Validator_1-2.png)
4. 在下一页，您将输入上面找到的会话密钥和 cMix ID。您还将选择奖励佣金百分比。
   
   a. 复制并粘贴在[获取会话密钥和 cMix ID 中](https://xxnetwork.wiki/index.php/Staking_a_Node#Get_Session_Keys_and_cMix_ID)找到的[会话密钥](https://xxnetwork.wiki/index.php/Staking_a_Node#Get_Session_Keys_and_cMix_ID)
   b. 选择百分比奖励佣金百分比（0 到 100 之间的值）。如果您希望网络用户提名您的验证人，我们建议使用低于 10% 的值。
   c. 选择是否允许新提名。我们强烈建议您始终允许网络用户提名您的验证人。
   d. 复制并粘贴在[Get Session Keys 和 cMix ID 中](https://xxnetwork.wiki/index.php/Staking_a_Node#Get_Session_Keys_and_cMix_ID)找到的十六进制格式的[cMix ID](https://xxnetwork.wiki/index.php/Staking_a_Node#Get_Session_Keys_and_cMix_ID)。
   e. 然后，单击*绑定和验证*按钮![Explorer Bond & Validate button.svg](https://xxnetwork.wiki/images/thumb/c/c1/Explorer_Bond_%26_Validate_button.svg/135px-Explorer_Bond_%26_Validate_button.svg.png)。
   
   [![设置验证器第 2 页，共 2 页。](https://xxnetwork.wiki/images/3/32/Explorer_-_Setup_Validator_2-2.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Setup_Validator_2-2.png)
5. 下一页用于授权交易。
   
   a. 这些是将应用于提交的费用。
   b. 仔细检查钱包地址以确保它是正确的。交易必须从您的**存储账户**发送。
   c. 使用您的密码解锁帐户，以便签署交易。
   d. 默认情况下，选择*不包括块作者的提示*。您可以添加提示以提高事务优先级。
   e. 此交易的调用哈希。
   f. 确保选择了*签名和提交*切换![Explorer 签名并提交 toggle.svg](https://xxnetwork.wiki/images/thumb/0/00/Explorer_Sign_and_Submit_toggle.svg/158px-Explorer_Sign_and_Submit_toggle.svg.png)。
   g. 单击“*签名并提交”*按钮![Explorer 签名并提交 button.svg](https://xxnetwork.wiki/images/thumb/d/d0/Explorer_Sign_and_Submit_button.svg/136px-Explorer_Sign_and_Submit_button.svg.png)。
   
   [![授权交易窗口。](https://xxnetwork.wiki/images/2/2b/Explorer_-_Authorize_Transaction.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Authorize_Transaction.png)
6. 您应该会在右上角看到这些通知，表明操作已成功。
   [![交易动作通知。](https://xxnetwork.wiki/images/c/c0/Transaction_Action_Notification.png)](https://xxnetwork.wiki/index.php/File:Transaction_Action_Notification.png)

## 4.等待选举

1. 在导航子菜单中，单击“*等待”*按钮或导航至[https://explorer.xx.network/#/staking/waiting](https://explorer.xx.network/#/staking/waiting)。
   [![等待导航子菜单。](https://xxnetwork.wiki/images/0/00/Explorer_-_Waiting_Submenu_Nav.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Waiting_Submenu_Nav.png)
2. 您应该会在等待验证者列表中看到您的**stash 帐户**。
   [![等待验证器列表。](https://xxnetwork.wiki/images/c/c2/Waiting_Validators.png)](https://xxnetwork.wiki/index.php/File:Waiting_Validators.png)
3. 在导航子菜单中，单击*概览*按钮或导航至[https://explorer.xx.network/#/staking](https://explorer.xx.network/#/staking)。
   [![导航子菜单上的概览按钮。](https://xxnetwork.wiki/images/1/19/Explorer_-_Overview_Submenu_Nav.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_Overview_Submenu_Nav.png)
4. 右上角是一个计时器，显示一个时代的长度和当前时代的年龄。
   [![计时器，告诉时代的年龄。](https://xxnetwork.wiki/images/b/bd/Era_Timer.png)](https://xxnetwork.wiki/index.php/File:Era_Timer.png)
5. 时代结束后，您的验证人应被选中并显示在验证人列表中。
   [![资源管理器中的验证器列表。](https://xxnetwork.wiki/images/1/17/Explorer_-_List_of_Validators.png)](https://xxnetwork.wiki/index.php/File:Explorer_-_List_of_Validators.png)
6. 您可以检查 xx 链日志文件chain.log以查看您的节点是否已同步。

到此，您的节点抵押设置完成。

