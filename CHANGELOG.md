# 2026-04-26

- 修复 Network 面板重复执行 Command+A 后虚拟列表部分可见行未同步选中样式的问题 @leereliu
- 修复 Electron 默认 Select All 菜单 accelerator 抢占 Command+A，导致 Network 全选请求无法触发的问题，并补充主进程快捷键保障 @leereliu
- 修复 macOS 下 Command+A 被 Electron 菜单消费导致 Network 面板无法全选请求的问题 @leereliu
- 修复 Network 面板 Command+A 在列表未获得焦点时无法选择当前可见请求的问题 @leereliu
- 增加 Network 面板 Command+A 和 Ctrl+A 选择当前可见请求，便于导出 HAR @leereliu
- 修复 macOS 证书安装完成标记复用导致新 root.crt 未被系统信任的问题 @leereliu
- 修复 macOS 证书安装弹框循环出现导致应用卡住的问题 @leereliu
- Add GitHub Actions release workflow for macOS dmg packages on `main` branch updates @leereliu

# 2021-11-16
- 多网卡支持 @xcodebuild
- Multiple network interface support
- electron@12 => electron@16
- electron-store@4 => electron-store@8.0.1

- Linux 支持 @shouhuanxiaoji
- Linux Supported @shouhuanxiaoji
# 2021-07-13

- 规则编辑增加悬浮的快速模板按钮 @xcodebuild
- Quick template button for rule editing @xcodebuild

- 修复部分样式错误 @xcodebuild
- Fix some style errors @xcodebuild
