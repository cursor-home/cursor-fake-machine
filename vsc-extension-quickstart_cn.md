# VSCode 插件开发快速入门

## 文件夹内容说明

* 此文件夹包含了开发插件所需的所有文件。
* `package.json` - 这是插件的清单文件，用于声明插件和命令。
  * 示例插件注册了一个命令并定义了其标题和命令名称。有了这些信息，VSCode 就可以在命令面板中显示该命令。此时插件还未被加载。
* `extension.js` - 这是主文件，用于实现命令的具体功能。
  * 该文件导出一个 `activate` 函数，该函数在插件首次被激活时被调用（在本例中是通过执行命令来激活）。在 `activate` 函数中，我们调用 `registerCommand`。
  * 我们将包含命令实现的函数作为第二个参数传递给 `registerCommand`。

## 快速开始

* 按 `F5` 打开一个新窗口，其中加载了你的插件。
* 通过命令面板（在 Mac 上按 `Cmd+Shift+P`，在 Windows/Linux 上按 `Ctrl+Shift+P`）运行你的命令，输入 `Hello World`。
* 在 `extension.js` 中设置断点来调试你的插件。
* 在调试控制台中查看插件的输出。

## 修改代码

* 在修改 `extension.js` 中的代码后，你可以从调试工具栏重新启动插件。
* 你也可以重新加载（在 Mac 上按 `Cmd+R`，在 Windows/Linux 上按 `Ctrl+R`）VSCode 窗口来加载你的更改。

## 探索 API

* 当你打开 `node_modules/@types/vscode/index.d.ts` 文件时，你可以查看完整的 API 文档。

## 运行测试

* 安装 [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
* 从活动栏打开测试视图并点击"运行测试"按钮，或使用快捷键 `Ctrl/Cmd + ; A`
* 在测试结果视图中查看测试输出。
* 修改 `test/extension.test.js` 或在 `test` 文件夹中创建新的测试文件。
  * 提供的测试运行器只会考虑匹配 `**.test.js` 名称模式的文件。
  * 你可以在 `test` 文件夹中创建子文件夹来组织你的测试。

## 进一步学习

* 遵循 [UX 指南](https://code.visualstudio.com/api/ux-guidelines/overview) 创建与 VSCode 原生界面和模式无缝集成的插件。
* 在 [VSCode 插件市场](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) 发布你的插件。
* 通过设置 [持续集成](https://code.visualstudio.com/api/working-with-extensions/continuous-integration) 来自动化构建。
* 集成到 [问题报告](https://code.visualstudio.com/api/get-started/wrapping-up#issue-reporting) 流程中，以获取用户报告的问题和功能请求。 