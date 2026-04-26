/**
 * 证书安装
 * Helper 安装等
 */
//@ts-ignore
import fs from 'fs-extra-promise';
//@ts-ignore
import tempdir from 'tempdir';
import path from 'path';
//@ts-ignore
import sudo from 'sudo-prompt';
//@ts-ignore
import forge from 'node-forge';
import { execSync } from 'child_process';
import {
    CERT_KEY_FILE_NAME,
    CERT_FILE_NAME,
    IPROXY_CERT_DIR_PATH,
    IPROXY_CERT_KEY_PATH,
    SYSTEM_IS_MACOS,
    SYSTEM_IS_LINUX,
    PROXY_CONF_HELPER_PATH,
    PROXY_CONF_HELPER_FILE_PATH,
} from './const';
import { clipboard, dialog } from 'electron';
import logger from 'electron-log';

import * as shell from 'shelljs';

const pki = forge.pki;

const sudoOptions = {
    name: 'iProxy',
};

const LEGACY_INSTALL_DONE_FILE = '/tmp/iproxy-install-done';

function shellQuote(value: string) {
    return "'" + value.replace(/'/g, "'\\''") + "'";
}

function isCurrentMacOSCertTrusted(certPath: string) {
    if (!SYSTEM_IS_MACOS) {
        return true;
    }

    try {
        execSync(
            `security verify-cert -c ${shellQuote(certPath)} -p ssl -k /Library/Keychains/System.keychain`,
            {
                // @ts-ignore
                windowsHide: true,
                stdio: 'ignore',
            },
        );
        return true;
    } catch (e) {
        logger.warn('Current root certificate is not trusted by macOS System keychain', e);
        return false;
    }
}

async function generateCert() {
    return new Promise((resolve) => {
        const keys = pki.rsa.generateKeyPair(2048);
        const cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = new Date().getTime() + '';
        cert.validity.notBefore = new Date();
        cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 10);
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 10);

        const attrs = [
            {
                name: 'commonName',
                value: 'iProxy-' + new Date().toISOString().slice(0, 10),
            },
            {
                name: 'countryName',
                value: 'CN',
            },
            {
                shortName: 'ST',
                value: 'Hangzhou',
            },
            {
                name: 'localityName',
                value: 'Hangzhou',
            },
            {
                name: 'organizationName',
                value: 'iProxy',
            },
            {
                shortName: 'OU',
                value: 'https://github.com/xcodebuild/iproxy',
            },
        ];

        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.setExtensions([
            {
                name: 'basicConstraints',
                critical: true,
                cA: true,
            },
            {
                name: 'keyUsage',
                critical: true,
                keyCertSign: true,
            },
            {
                name: 'subjectKeyIdentifier',
            },
        ]);
        cert.sign(keys.privateKey, forge.md.sha256.create());
        const certPem = pki.certificateToPem(cert);
        const keyPem = pki.privateKeyToPem(keys.privateKey);

        resolve({
            key: keyPem,
            cert: certPem,
        });
    });
}

function alertAndQuit() {
    dialog.showErrorBox(
        'Grant Authorization Failed 授权失败',
        `Grant Authorization Failed for install certificate and helper
macOS user Please input your user password when dialog
Windows user Please try to enable Property => Compatibility => Run program as Administrator
安装证书或者 helper 过程中授权失败
macOS 用户请尝试在弹出的对话框中输入用户密码
Windows 用户请尝试打开在 属性 => 兼容性 => 以管理员身份运营该应用
Deepin GNU/Linux 用户请安装libnss3-tools然后重启本软件

Application will quit
应用程序即将退出
    `,
    );
    process.exit(1);
}

export async function installCertAndHelper() {
    console.log('Install cert');
    const certs = (await generateCert()) as {
        key: string;
        cert: string;
    };

    const dir = (await tempdir()).replace('ADMINI~1', 'Administrator');

    // 写入证书
    await fs.mkdirp(dir);
    await fs.writeFileAsync(path.join(dir, CERT_KEY_FILE_NAME), certs.key, 'utf-8');
    await fs.writeFileAsync(path.join(dir, CERT_FILE_NAME), certs.cert, 'utf-8');

    const installDoneFile = path.join(dir, `iproxy-install-${process.pid}-${Date.now()}.done`);
    await fs.removeAsync(installDoneFile);
    await fs.removeAsync(LEGACY_INSTALL_DONE_FILE);

    // 信任证书 & 安装 helper
    const installPromise = new Promise((resolve, reject) => {
        if (SYSTEM_IS_MACOS) {
            // macOS big sur do not allow trust cert in any auto way
            // show box to guide user run command
            const certPath = path.join(dir, CERT_FILE_NAME);
            const cmd = `echo "Please input local login password 请输入本地登录密码" && rm -f ${shellQuote(
                    installDoneFile,
                )} && sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${shellQuote(
                    certPath,
                )} && sudo cp ${shellQuote(PROXY_CONF_HELPER_FILE_PATH)} ${shellQuote(
                    PROXY_CONF_HELPER_PATH,
                )} && sudo chown root:admin ${shellQuote(PROXY_CONF_HELPER_PATH)} && sudo chmod a+rx+s ${shellQuote(
                    PROXY_CONF_HELPER_PATH,
                )} && touch ${shellQuote(installDoneFile)} && echo "安装完成"
                `;
            clipboard.writeText(cmd);

            const MAX_RETRIES = 10;
            let retries = 0;
            let installed = false;

            while (!installed && retries < MAX_RETRIES) {
                const result = dialog.showMessageBoxSync({
                    type: 'info',
                    buttons: ['I have run the command / 我已执行命令', 'Cancel / 取消'],
                    defaultId: 0,
                    cancelId: 1,
                    message: `Paste command to your Terminal and run to install cert and helper\n（命令已复制到剪贴板）粘贴命令到终端并运行以安装并信任证书`,
                });

                if (result === 1) {
                    // user cancelled
                    reject(new Error('User cancelled installation'));
                    return;
                }

                if (fs.existsSync(installDoneFile) && isCurrentMacOSCertTrusted(certPath)) {
                    installed = true;
                } else {
                    clipboard.writeText(cmd);
                    dialog.showMessageBoxSync({
                        type: 'warning',
                        message: `Installation not detected or certificate is not trusted. Please run the command in Terminal and click OK when done.\n未检测到安装完成，或当前证书尚未被系统信任。请在终端执行命令后再点击确认。\n\n命令已重新复制到剪贴板。`,
                    });
                }
                retries++;
            }

            if (!installed) {
                reject(new Error('Installation not completed after retries'));
                return;
            }

            resolve(true);
        } else if (SYSTEM_IS_LINUX) {
            // only tested in deepin
            if (!shell.which('certutil')) {
                reject('证书未成功安装，请先确认libnss3-tools是否安装');
            } else {
                const command = `certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n iProxy -i "${path.join(
                    dir,
                    CERT_FILE_NAME,
                )}" && touch ${shellQuote(installDoneFile)} && echo "安装完成"`;
                console.log('run command', command);
                try {
                    const output = execSync(command, {
                        // @ts-ignore
                        windowsHide: true,
                    });
                    console.log('certutil result', output.toString());
                } catch (e) {
                    // @ts-ignore
                    console.log('error', e.message, e.stderr.toString(), e.stdout.toString());
                }
            }
            resolve(true);
        } else {
            dialog.showMessageBoxSync({
                type: 'info',
                message: `The certificate and proxy helper is not installed or has expired. You need to install. You may need to enter the password of the login user.
        未安装证书/代理helper或者已经过期，需要安装，可能会需要输入登录用户的密码。
                `,
            });
            fs.copyFileSync(PROXY_CONF_HELPER_FILE_PATH, PROXY_CONF_HELPER_PATH);
            const command = `certutil -enterprise -f -v -AddStore "Root" "${path.join(
                dir,
                CERT_FILE_NAME,
            )}"  && sudo cp "${PROXY_CONF_HELPER_FILE_PATH}" "${PROXY_CONF_HELPER_PATH}" && sudo chown root:admin "${PROXY_CONF_HELPER_PATH}" && sudo chmod a+rx+s "${PROXY_CONF_HELPER_PATH}"`;
            console.log('run command', command);
            try {
                const output = execSync(command, {
                    // @ts-ignore
                    windowsHide: true,
                });
                console.log('certutil result', output.toString());
            } catch (e) {
                // @ts-ignore
                console.log('error', e.message, e.stderr.toString(), e.stdout.toString());
            }

            // windows dose not need install helper
            resolve(true);
        }
    });

    console.log('before install');
    try {
        await installPromise;
    } catch (e) {
        console.error(e);
        alertAndQuit();
        // prevent copy cert after failed
        return;
    }
    console.log('after install');
    // 信任完成，把证书目录拷贝过去
    await fs.removeAsync(installDoneFile);
    await fs.copyAsync(dir, IPROXY_CERT_DIR_PATH);
    console.log('copy cert done');
}

async function checkCertInstall() {
    const certPath = path.join(IPROXY_CERT_DIR_PATH, CERT_FILE_NAME);
    const certKeyExist = await fs.existsAsync(IPROXY_CERT_KEY_PATH);
    const certExist = await fs.existsAsync(certPath);
    if (!certKeyExist || !certExist) {
        return false;
    }
    const { ctimeMs } = await fs.statAsync(IPROXY_CERT_KEY_PATH);

    // expire at 11 month(cert expire in 1 year in fact)
    const expireTime = ctimeMs + 11 * 30 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    logger.info({ ctimeMs, certKeyExist, certExist, expireTime, currentTime });

    return currentTime < expireTime && isCurrentMacOSCertTrusted(certPath);
}

async function checkHelperInstall() {
    if (!SYSTEM_IS_MACOS) {
        return true;
    }
    if (!(await fs.existsAsync(PROXY_CONF_HELPER_PATH))) {
        return false;
    }
    const info = await fs.statAsync(PROXY_CONF_HELPER_PATH);
    if (info.uid !== 0) {
        // 权限不对
        return false;
    }
    return true;
}

// 检查安装状态，如果没安装就安装一下
export default async function checkInstallStatus() {
    if ((await checkCertInstall()) && (await checkHelperInstall())) {
        // pass
    } else {
        await installCertAndHelper();
    }
}
