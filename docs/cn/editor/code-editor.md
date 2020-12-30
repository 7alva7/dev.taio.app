# 代码编辑器

Taio 提供了一个完善的 Markdown 编辑器，我们将通过本文来介绍其中的技术细节。

实际上，我们从一开始就没打算“只”做一个 Markdown 编辑器，Markdown 只是代码编辑的一种 `模式`，编辑器也可以支持其他模式。这样通用的设计提供了极大的灵活性，例如 Taio 支持运行 JavaScript，在编辑 JavaScript 的时候，使用的是同一个编辑器内核，加上不同的 `语言特性`。

另一方面，尽管 Taio 不是一个通用的代码编辑器，我们仍然为常见的编程语言提供了代码高亮，这可以让用户在浏览相关文件时体验更好。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_17.png" width="360" />

## 代码高亮

如果仅针对 Markdown，问题可能并不复杂。但我们的目标是一个通用的代码编辑器，这就需要支持常见语言，Markdown 只是其中之一。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_18.png" width="360" />

与 Web 领域不同的是，在 iOS 生态下我们很难找到完美的开源解决方案，但我们可以从一些高质量项目中获得启发。

**纯 Web 技术**

也既使用 `WebView` 封装 [highlight.js](https://highlightjs.org/) 或 [Prism](https://prismjs.com/) 一类的 Web 项目，开发成本很低，在**阅读代码**时也能取得不错的效果。

```xml
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="default.css">
    <script src="highlight.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>
  </head>
  <body>
    <pre><code>const string = "Hello, World!";</code></pre>
  </body>
</html>
```

此类方案很成熟，但如需支持编辑，则很难达到原生编辑器的流畅体验。

**纯原生技术**

也既完全使用原生技术实现对语言的语法分析，并通过 [TextKit](https://developer.apple.com/documentation/appkit/textkit) 渲染出来。可以参考的例子有 [SavannaKit](https://github.com/louisdh/savannakit) 和其继任者 [Sourceful](https://github.com/twostraws/Sourceful)。

此类方案的缺陷是有太多内容需要自己实现，例如语言的语法定义和编辑器主题。

**取长补短**

综合 Web 技术的成熟和原生技术的性能是个不错的想法，这样的方案是存在的。

我们可以通过 [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore) 高性能地运行上述 JavaScript 项目，将得到的结果用原生的方式渲染出来，[Highlightr](https://github.com/raspu/Highlightr) 项目采用的就是这个思路。

```xml
<span class="hljs-section"># Hi</span>

Hello, World!
```

这类方案可以低成本地得到上百种编程语言的支持，以及几十个编辑器主题。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_19.png" width="360" />

> 我们可以从上述项目获得一些方向，但维护自己的实现仍然是值得的投入。毕竟编辑器是核心功能，我们很难去依赖社区有限的投入。

## 自动补全

与很多 IDE 类似的，Taio 在编辑 JavaScript 时，可以补全 API、分析类型，甚至高亮同一引用。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_20.png" width="360" />

为了实现这些语言特性，Taio 使用 [Tern](https://ternjs.net/) 进行 JavaScript 分析，并通过 TextKit 绘制分析结果。

Tern 是一个为 Node.js 和浏览器实现的 JavaScript 项目，需要一些工作才能在 JavaScriptCore 上使用，我们在之后可能会通过一篇单独的文章进行更详细的介绍。

> 通用解决方案：[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)

## 代码格式化

针对语言对代码格式进行自动调整可以让编辑体验更好，这里举几个例子。

**括号自动完成**

当用户输入 `if (condition) {` 然后按下换行之后，出现在编辑器上的应该是：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_21.png" width="360" />

实现这个功能，我们需要用一个栈来进行[括号匹配](https://leetcode.com/problems/valid-parentheses/)，然后根据缩进的层级填充空格。

> Taio 也会检测当前代码是基于空格缩进还是 Tab 缩进，进而填充不同的字符。

**列表自动完成**

当用户对 Markdown 列表换行之后，编辑器需要自动补全其格式，包括无序列表、有序列表和任务列表。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_22.png" width="360" />

此功能通过检测上一行文本是否匹配一个正则表达式来实现，例如有序列表：

```regexp
^ *(\\d+)\\. +
```

将匹配中的第一组数字加一，得到的就是下一行自动补全的列表项。类似的，任务列表使用 `^ *- +\\[[ xX]\\] +` 来匹配。

以上的例子都使用 `UITextViewDelegate` 的 [shouldChangeTextIn](https://developer.apple.com/documentation/uikit/uitextviewdelegate/1618630-textview) 方法实现：

```swift
func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
  if text == "\n" {
    // Format the code
    return false
  }
  return true
}
```

**Tab 转换成空格**

与很多 IDE 一样，Taio 也支持在键盘上输入 Tab 之后，转换成空格。方法是类似的，仅需在 `shouldChangeTextIn` 中检测是否输入了 `\t`。

> 支持用户配置 Tab 还是空格，体验可能会更好。

## 键盘快捷键

`UITextView` 原生便支持复制粘贴等快捷键，但为了让体验更接近桌面编辑器，我们为 Taio 提供了更丰富的支持：

- `⌘ -` 缩小字号，`⌘ +` 放大字号，`⌘ 0` 重置字号
- `⌘ B` 切换粗体，`⌘ I` 切换斜体，`⌘ U` 切换下划线
- `⌘ 1` 一级标题，`⌘ 2` 二级标题，`⌘ 3` 三级标题
- `⌘ [` 减少缩进，`⌘ ]` 增加缩进

这些快捷键符合用户直觉，按住 `⌘` 即可看到所有的使用方式。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_23.png" width="360" />

实现这些仅需重写 `UIResponder` 的 [keyCommands](https://developer.apple.com/documentation/uikit/uiresponder/1621141-keycommands) 方法：

```swift
override var keyCommands: [UIKeyCommand]? {
  return [
    UIKeyCommand(
      title: "Reset Font Size",
      image: nil,
      action: #selector(resetFontSize),
      input: "0",
      modifierFlags: .command,
      propertyList: nil
    )
  ]
}
```

> 需要确保所对应的 UIResponder 可以是 firstResponder。

## 字体

用户可以在 Taio 使用设备上的任何字体：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_24.png" width="360" />

这个功能我们使用 [UIFontPickerViewController](https://developer.apple.com/documentation/uikit/uifontpickerviewcontroller) 实现，如需支持用户安装的字体，需在 `Info.entitlements` 中开启：

```xml
<key>com.apple.developer.user-fonts</key>
<array>
  <string>app-usage</string>
</array>
```

此外，FontPicker 并没有提供好的方式来选择 `systemFont`，这将导致恢复默认设置不方便。我们的做法是将 FontPicker 包装到另一个 UIViewController，然后在其左上角添加一个 `System Font` 按钮。

> 此方法会失去搜索栏，可能有更好的方式。

在显示代码时，我们会默认使用等宽字体：

```swift
let font: UIFont? = {
  if #available(iOS 13.0, *) {
    return .monospacedSystemFont(ofSize: 15, weight: .regular)
  } else {
    return UIFont(name: "Menlo-Regular", size: 15)
  }
}()
```

## 行距

我们使用了 [lineHeightMultiple](https://developer.apple.com/documentation/uikit/nsmutableparagraphstyle/1524596-lineheightmultiple) 特性实现了文字间距功能：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_25.png" width="360" />

如果造成了文字和光标不对齐的问题，我们可以通过 `NSLayoutManager` 的 [drawGlyphs](https://developer.apple.com/documentation/uikit/nslayoutmanager/1403158-drawglyphs) 方法调整：

```swift
override func drawGlyphs(forGlyphRange glyphsToShow: NSRange, at origin: CGPoint) {
  // Change origin accordingly
  super.drawGlyphs(forGlyphRange: glyphsToShow, at: origin)
}
```

## 行号

代码编辑器显示行号是非常常见的需求，在 Taio 中也可以打开这个选项：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_26.png" width="360" />

这个功能也是通过自定义 `NSLayoutManager` 实现的，方法是重写 [drawBackground](https://developer.apple.com/documentation/uikit/nslayoutmanager/1402949-drawbackground) 方法，可以参考 [CYRTextView](https://github.com/illyabusigin/CYRTextView) 项目。

> 同样的，我们还可以实现当前行的高亮效果。

## 括号高亮

前面我们已经提到了查找匹配括号的方法，类似的逻辑可以用来实现 Xcode 中提供的括号高亮功能。

当光标停留在括号旁边时，我们可以查找其对应括号所在位置，并进行高亮显示。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_27.png" width="360" />

这将有助于用户识别一个代码块，或是 Markdown 中的一个链接。

## 更多内容

以上内容是我们在过去多年项目开发中的经验总结，希望对大家有所帮助。

如果想支持我们，请体验我们的应用 [Taio](https://taio.app/cn/)，并让您的朋友知道。

我们会在之后分享更多技术细节，敬请期待。

> [!NOTE] 2020 年 12 月 30 日