import React, { useState, useEffect } from 'react';
import { CoreAPI } from '../../core-api';
import { Extension } from '../../extension';
import { useThemeMode } from '../../hooks/use-theme-mode';
import { getWhistlePort } from '../../utils';
import { setUiFont } from '../../set-ui-font';
export class Weinre extends Extension {
    constructor() {
        super('weinre');
    }

    panelIcon() {
        return 'bug';
    }

    panelTitle() {
        return 'Debugger';
    }

    panelComponent() {
        const DebuggerPanelComp = () => {
            const [port, setPort] = useState(null as null | number);

            useEffect(() => {
                (async () => {
                    const port = await getWhistlePort(this.coreAPI);
                    setPort(port);
                })();
            }, []);

            useEffect(() => {
                CoreAPI.eventEmmitter.emit('weinre-enter');
                return function() {
                    CoreAPI.eventEmmitter.emit('weinre-exit');
                };
            }, []);

            const { isDarkMode } = useThemeMode();

            function changeIframeStyle() {
                const iframeDocumentHead = document.querySelector('iframe')?.contentDocument?.querySelector('head');
                if (iframeDocumentHead) {
                    const customStyle = document.createElement('style');
                    customStyle.textContent = `.content-header {
                        background: #f5f5f5;
                        border: none;
                    }
                    
                    `;
                    iframeDocumentHead.appendChild(customStyle);
                    setUiFont(document.querySelector('iframe')!.contentDocument!.body)

                    const container = document.querySelector('iframe')?.contentDocument?.querySelector('.description');

                    if (container) {
                        container.innerHTML = 'Add \`iproxy=true\` to url query for debugging';
                        (container as HTMLElement).style.display = "block"
                    }
                }
            }

            return (
                <div className="iproxy-network-panel no-drag">
                    {port ? (
                        <iframe
                            src={`http://127.0.0.1:${port}/plugin.chii-internal/`}
                            className="iproxy-network-iframe"
                            onLoad={changeIframeStyle}
                        ></iframe>
                    ) : (
                        <div className="iproxy-tip">代理未启动</div>
                    )}
                </div>
            );
        };

        return DebuggerPanelComp;
    }
}
