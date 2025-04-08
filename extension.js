/**
 * 这是一个用于修改 Cursor 编辑器机器标识的 VSCode 插件
 * 主要功能是修改 Cursor 的 telemetry.macMachineId，支持自定义 ID 或随机生成
 */

const vscode = require('vscode');
const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * 获取 storage.json 文件的路径
 * 优先使用用户在设置中指定的路径，如果没有指定或路径无效，则使用默认路径
 * @returns {string} storage.json 文件的完整路径
 * @throws {Error} 如果操作系统不支持则抛出错误
 */
function getStoragePath() {
    // 首先检查用户是否在设置中指定了路径
    const config = vscode.workspace.getConfiguration('cursorFakeMachine');
    const customPath = config.get('storagePath');

    if (customPath && fs.existsSync(customPath)) {
        return customPath;
    }

    // 如果没有指定或路径无效，使用默认路径
    const platform = os.platform();
    let basePath;

    switch (platform) {
        case 'win32':
            basePath = path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage');
            break;
        case 'darwin':
            basePath = path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage');
            break;
        case 'linux':
            basePath = path.join(os.homedir(), '.config', 'Cursor', 'User', 'globalStorage');
            break;
        default:
            throw new Error('不支持的操作系统');
    }

    return path.join(basePath, 'storage.json');
}

/**
 * 修改 Cursor 的机器标识
 * 读取 storage.json 文件，修改或添加 telemetry.macMachineId 字段
 * @returns {Object} 包含操作结果的详细信息
 * @throws {Error} 如果文件不存在或修改失败则抛出错误
 */
function modifyMacMachineId() {
    try {
        const storagePath = getStoragePath();

        // 检查文件是否存在
        if (!fs.existsSync(storagePath)) {
            throw new Error(`文件不存在: ${storagePath}`);
        }

        // 读取文件
        let data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));

        // 获取用户配置的 machineId 或生成随机 ID
        const config = vscode.workspace.getConfiguration('cursorFakeMachine');
        const customMachineId = config.get('customMachineId');
        const newMachineId = customMachineId || generateRandomMachineId();

        data['telemetry.macMachineId'] = newMachineId;

        // 写回文件
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8');

        return {
            success: true,
            message: '已成功修改 telemetry.macMachineId',
            newId: newMachineId,
            path: storagePath,
        };
    } catch (error) {
        throw new Error(`修改失败: ${error.message}`);
    }
}

/**
 * 生成随机的 UUID v4 格式的机器标识
 * @returns {string} 生成的 UUID
 */
function generateRandomMachineId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * 终止所有 Cursor 进程
 * 根据不同操作系统使用不同的命令
 * @returns {Promise} 返回一个 Promise，成功时 resolve，失败时 reject
 * @throws {Error} 如果操作系统不支持则抛出错误
 */
async function killCursorProcesses() {
    const platform = os.platform();
    const exec = require('child_process').exec;

    return new Promise((resolve, reject) => {
        let command = '';
        switch (platform) {
            case 'win32':
                command = 'taskkill /F /IM "Cursor.exe"';
                break;
            case 'darwin':
                command = 'pkill -9 Cursor';
                break;
            case 'linux':
                command = 'pkill -9 cursor';
                break;
            default:
                reject(new Error('不支持的操作系统'));
                return;
        }

        exec(command, error => {
            if (error && error.code !== 1) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
} 

/**
 * 插件激活时调用的函数
 * 注册命令并设置命令处理函数
 * @param {vscode.ExtensionContext} context 插件上下文
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('cursor-fake-machine.cursor-fake-machine', async function () {
        try {
            const result = modifyMacMachineId();

            // 显示成功消息
            vscode.window.showInformationMessage(`修改成功！\n路径: ${result.path}\n新的 machineId: ${result.newId}`);

            // 询问是否要重启 Cursor
            const answer = await vscode.window.showWarningMessage(
                '修改成功！是否要重启 Cursor 使更改生效？',
                { modal: true },
                '是',
                '否',
            );

            if (answer === '是') {
                try {
                    await killCursorProcesses();
                } catch (error) {
                    vscode.window.showErrorMessage(`操作失败: ${error.message}`);
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`修改失败: ${error.message}`);

            // 如果是路径不存在的错误，提示用户设置路径
            if (error.message.includes('不存在')) {
                const answer = await vscode.window.showQuestionMessage(
                    '是否要打开设置页面指定 storage.json 的路径？',
                    '是',
                    '否',
                );
                if (answer === '是') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'cursorFakeMachine.storagePath');
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * 插件停用时调用的函数
 * 目前为空，因为不需要清理资源
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
