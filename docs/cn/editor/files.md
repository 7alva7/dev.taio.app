# 现代文件应用

Taio 的 Markdown 编辑器基于完全开放的文件系统，这为应用协作以及数据迁移提供了基础，本文将介绍开发此类应用需要注意到的点。

当然，这一切都以您希望成为 iOS 平台上的良好公民、为优秀的生态贡献力量为基础。如果您最初的想法就是创建封闭的文件或格式，恐怕本文不会对您有什么帮助。

## 文件共享

早期的 iOS 并不具备做到这些优秀特性的基础，直到 Apple 发布了[文件应用](https://support.apple.com/zh-cn/HT206481)，以及一系列为文件共享而生的 API。

文件应用为共享的文件提供了统一的用户界面，开发者可以通过在 `Info.plist` 内开启 `UIFileSharingEnabled` 来将 `Documents` 目录暴露给文件应用。

```xml
<key>UIFileSharingEnabled</key>
<true/>
```

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_8.png" width="360">

## iCloud 云盘

上面提到的 `Documents` 目录是本地的，iOS 也提供了云存储方案 `iCloud Drive`，它有很多好处：

- 使用 iCloud 账号，无需自建用户系统，用户无需额外的登录
- 与文件管理相关的 API 无缝结合
- 基于用户的 iCloud 额度，开发者无需为此付费

所以在 iOS 上创建文档同步，iCloud Drive 是不二之选。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_9.png" width="360">

其使用方式也很简单，只需为应用分配一个 iCloud Container，然后在应用内使用 [FileManager](https://developer.apple.com/documentation/foundation/filemanager) 的如下方法去获取路径：

```swift
let url = FileManager.default.url(forUbiquityContainerIdentifier: nil)
```

程序需要处理 `url` 为 `nil` 的情况，例如用户未登录 iCloud，或未授予应用 iCloud Drive 权限。

> 当权限发生变化时，系统会发出 [NSUbiquityIdentityDidChange](https://developer.apple.com/documentation/foundation/nsnotification/name/1407629-nsubiquityidentitydidchange) 通知，可以监听此通知来处理界面变化。

## File Provider

上述两种方式分别为本地文件和 iCloud 文件提供了文件应用的支持，但仍然无法处理文件处于别的位置的情况。例如支持 Extensions 的应用可能会将文件存放在 [Shared Container](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html) 方便主应用和 Extension 同时使用。

对于这种情况，我们可以采用 [File Provider Extension](https://developer.apple.com/documentation/fileprovider) 来为文件应用提供文件。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_10.png" width="360">

File Provider 的开发并不复杂，推荐参考 [ish](https://ish.app/) 应用的 [File Provider](https://github.com/ish-app/ish/tree/master/app/FileProvider) 完整实现，在此便不再赘述。

> 此外，您的应用还可以支持 [File Provider UI Extension](https://developer.apple.com/documentation/fileproviderui)，它可以为文件应用提供自定义的操作。

## Document types

应用可以在 `Info.plist` 文件注册接受的文件类型，例如：

```xml
<dict>
  <key>CFBundleTypeName</key>
  <string>Markdown File</string>
  <key>LSHandlerRank</key>
  <string>Owner</string>
  <key>LSItemContentTypes</key>
  <array>
    <string>net.daringfireball.markdown</string>
  </array>
</dict>
```

这样便可接收来自 AirDrop 或 Share Sheet 分享的文件，然后使用 `AppDelegate` 或 `SceneDelegate` (Multiple Windows) 相关的方法进行处理。

为了让体验更好，我们可以支持导入目录，而不仅仅是单个文件：

```xml
<dict>
  <key>CFBundleTypeName</key>
  <string>Folder</string>
  <key>CFBundleTypeOSTypes</key>
  <array>
    <string>fold</string>
  </array>
  <key>CFBundleTypeRole</key>
  <string>Viewer</string>
  <key>LSHandlerRank</key>
  <string>Default</string>
  <key>LSItemContentTypes</key>
  <array>
    <string>public.folder</string>
  </array>
</dict>
```

> Taio 在接收到目录后，会引导用户将其保存至某个位置。

## Exported Type Identifiers

除了接收文件，应用也可以定义专属的文件类型。例如 Taio 的动作其本质是一个 JSON 文件，我们将其定义为了 `taioactions`:

```xml
<dict>
  <key>UTTypeConformsTo</key>
  <array>
    <string>public.json</string>
  </array>
  <key>UTTypeDescription</key>
  <string>FileTypeTaioActionsDescription</string>
  <key>UTTypeIdentifier</key>
  <string>app.cyan.taio-actions</string>
  <key>UTTypeTagSpecification</key>
  <dict>
    <key>public.filename-extension</key>
    <string>taioactions</string>
    <key>public.mime-type</key>
    <string>application/json</string>
  </dict>
</dict>
```

用户可以看到明确的类型描述，别的应用也可以将此类型注册为支持的类型：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_11.png" width="360">

> 上述 `FileTypeTaioActionsDescription` 为可本地化字符串的 Key。

## UIDocumentBrowserViewController

如果您的应用是完全基于文档的，基于 [UIDocumentBrowserViewController](https://developer.apple.com/documentation/uikit/uidocumentbrowserviewcontroller) 来实现可能是一个很好的方式，Apple 的 [iWork](https://www.apple.com/iwork/) 三件套正是基于这个方式实现。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_12.png" width="360">

不过 Taio 并没有这样实现，因为我们想要更多交互上的灵活性，而 Apple [文档](https://developer.apple.com/documentation/uikit/view_controllers/adding_a_document_browser_to_your_app)明确指出：

> Always assign the document browser as your app's root view controller. Don't place the document browser in a navigation controller, tab bar, or split view, and don't present the document browser modally.

此外，如果需要在应用内打开文件选择器，应该使用 [UIDocumentPickerViewController](https://developer.apple.com/documentation/uikit/uidocumentpickerviewcontroller) 而不是 UIDocumentBrowserViewController。

关于这个部分，您可以参考开源项目 [textor](https://github.com/louisdh/textor) 了解更多。

## Open in Place

上面我们提到了在应用内打开外部文件的方法，该方法会在应用内创建文件拷贝。而 `Open in Place` 则可以直接打开其他应用的文件，并直接编辑它们本身。

方法是在 `Info.plist` 内指定：

```xml
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
```

和文件导入类似的，您需要处理 `SceneDelegate` 的方法，`UIOpenURLContext` 告诉了您是否属于 Open in Place 操作：

```swift
if context.options.openInPlace {

}
```

应用如需访问 Open in Place 的文件，需要使用 [URL](https://developer.apple.com/documentation/foundation/url) 的两个方法：

- [startAccessingSecurityScopedResource](https://developer.apple.com/documentation/foundation/url/1779698-startaccessingsecurityscopedreso)
- [stopAccessingSecurityScopedResource](https://developer.apple.com/documentation/foundation/url/1780153-stopaccessingsecurityscopedresou)

此外，支持 Open in Place 后，长按 iPad 应用的桌面图标会显示最近访问的文件：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_13.png" width="360">

> [Working Copy](https://docs.taio.app/#/cn/integration/working-copy) 应用的作者为 Open in Place 创建了很好的[示例项目](https://github.com/palmin/open-in-place)，推荐参考。

## 文件书签

URL 的 [bookmarkData](https://developer.apple.com/documentation/foundation/url/2143023-bookmarkdata) 接口并不是新内容：

```swift
let bookmarkData = try url.bookmarkData()
```

您可以用来记录最近访问的文件，通过 `resolvingBookmarkData` 将其还原成文件路径：

```swift
let url = try URL(
  resolvingBookmarkData: data,
  bookmarkDataIsStale: &bookmarkIsStale
)
```

即便文件被移动，我们依然可以正确地取回其路径。相比起这个优势，文件书签可以用来存储 Open in Place 的文件，以便下次访问。

或者，存储使用 `UIDocumentPickerViewController` 打开的文件或目录，让其可以随时被访问。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_14.png" width="360">

Taio 支持这个特性，所以用户可以在 Taio 内随时编辑链接好的第三方文件。

## UIDocument

[UIDocument](https://developer.apple.com/documentation/uikit/uidocument) 提供了一系列对文档的封装，让开发者可以更方便地处理文件打开、保存，以及状态变化，可以参考上面提到的 [textor](https://github.com/louisdh/textor) 项目中的一些例子，我们在这里重点关于其冲突处理。

文件的版本冲突，在多端编辑或者多个应用编辑里面是很常见的。我们可能在 Client A 和 Client B 里同时编辑了某文件，然后在某设备上产生了多个副本。

[NSFileVersion](https://developer.apple.com/documentation/foundation/nsfileversion) 提供了获取冲突版本的方法：

```swift
let versions = NSFileVersion.unresolvedConflictVersionsOfItem(at: url)
```

参考 [Apple 文档](https://developer.apple.com/library/archive/documentation/DataManagement/Conceptual/DocumentBasedAppPGiOS/ResolveVersionConflicts/ResolveVersionConflicts.html)，程序可以设计为用户解决冲突的策略，例如总是使用最新的版本。不过 Taio 是一个文本编辑器，我们觉得让用户对比差异是一个更棒的想法：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_15.png" width="360">

这样一来，用户总是对版本的变化充满信心，同样的交互也用在了 Taio 的历史版本功能。

## TextBundle

[TextBundle](http://textbundle.org/) 作为一个开放的标准，为跨应用的文件共享进一步地提供了方便。

一个 TextBundle 目录内，包含了元数据和一个主要的文本文档，以及用于放置图片资源的 `assets` 目录。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_16.png" width="360">

这样的格式，可以将文档和其引用的资源打包成一个文件，在支持 TextBundle 的应用间共享。

可以参考 TextBundle 的[标准描述](http://textbundle.org/spec/)来了解如何实现，或参考开源的 [TextBundle](https://github.com/shinyfrog/TextBundle) 项目。

> 上述项目也是一个 [FileWrapper](https://developer.apple.com/documentation/foundation/filewrapper) 的示例。

## Trash 操作

相比直接删除文件，应用也可以使用 FileManager 的 `trashItem` 方法：

```swift
try FileManager.default.trashItem(at: url, resultingItemURL: &resultingURL)
```

通过这个方法移除的文件，会跑到文件应用的 `最近删除` 目录，用户可以恢复。该方法实际上为文件创建了一个 `.Trash` 隐藏目录，并且会自动处理命名问题。

## 更多内容

我们可以看到，想要让基于文件的应用体验上乘并不容易，Taio 为此做了很多工作，并且还有很多优化空间。

Apple 提供了针对文件应用的一系列教程，例如 [Document Based Apps](https://developer.apple.com/document-based-apps/)，以及在 WWDC 上发布的一系列相关课程，推荐进行进一步的了解。

最后，感谢在文中引用的第三方内容为生态做出的贡献。

> [!NOTE] 2020 年 12 月 24 日