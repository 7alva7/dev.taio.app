> [!NOTE] 2020 年 12 月 16 日

# 编辑器工具栏体验

在移动端编辑场景里面，辅助工具栏的体验至关重要，尤其在没有外接键盘辅助的时候。为此，Taio 设计了极为方便的工具栏，可以用它输入符号，或者快速完成一些任务：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_1.png" width="360" />

本文阅读时间需要不到十分钟，希望有能对您有用的部分。

## inputAccessoryView

在 iOS 上面实现这样的工具栏，我们大部分时候都会采用 `inputAccessoryView`，而不是通过监听键盘位置的方式：

```swift
textView.inputAccessoryView = UIView(...)
```

您可以使用任何 `UIView` 实现这个工具栏，但我们不建议这样做。为了实现像很多系统应用那样与键盘融为一体的工具栏，我们应该使用 `UIInputView`，并为它提供键盘的风格：

```swift
textView.inputAccessoryView = UIInputView(..., inputViewStyle: .keyboard)
```

这样一来，iOS 会自动为您提供和键盘背景完全一致的风格，无需自行管理它的颜色。

## 安全区域

在连接外接键盘时，用户可以选择性地把软键盘收起来。这个时候，您应该把底部的安全区域考虑进去，像是这样：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_2.png" width="360" />

而不是让 `Home Indicator` 盖住您的工具栏。

## inputView

在必要的时候，我们可能需要为 TextView 提供“第二键盘”，比如 Taio 里面的工具面板和短语面板：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_3.png" width="360" />

这个功能是通过覆盖 TextView 的 `inputView` 实现的：

```swift
textView.inputView = UIView(...)
textView.reloadInputViews()
```

值得注意的是，这里有一个极其细节的体验，发生在用户使用部分输入法的时候（例如拼音）。

当输入法的选字区域有一些字的时候，把键盘切换到 `inputView` 实现的界面，然后再切换回来。这个时候，待选区会突然消失，用户感受到的是键盘高度的**突然**变化。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_4.png" width="720" />

这个问题出现在了绝大多数的应用里面，包括 Apple 提供的第一方应用，但我们没有放过它。

我们注意到：**用户在移动光标之后，这个待选区又会突然回来**。所以我们重写了 `setInputView` 方法，在检测到回到键盘之后，我们会：

- 把光标移动一格（方向无关紧要）
- 再移动回来

通过这个小把戏，用户感受不到任何突然的变化，一切都很完美。

## 按键音效

因为操作发生在键盘的扩展区域，把这些操作加上键盘声（用户可选择关掉）是非常自然的事情。

`UIDevice` 有一个 `playInputClick` 方法，可以通过实现 `enableInputClicksWhenVisible` 来使用。

不过还有一个更粗暴的方法：

```swift
AudioServicesPlaySystemSound(1104)
```

*It's pure magic.*

## 支持 Pointer 交互

因为我们的应用期待用户在一个连接了妙控键盘的 iPad 上使用，所以键盘上的按钮支持触摸板的 `Hover` 效果就极为重要，用户会非常期待鼠标停在按钮上的时候是有反馈的。

关于这个部分我们不再赘述，您可以在 Apple 开发者官网找到很多 WWDC 课程。

我们尤其推荐：[Design for the iPadOS pointer](https://developer.apple.com/videos/play/wwdc2020/10640/)。

## 分页滚动

工具栏我们使用普通的 `UIScrollView` 实现，它可以很好地工作，但我们希望对滚动进行进一步的优化。

简单说，用户会期待每次滚动都是精确的，而不是一滚就不知道滚到哪里去了，这对提升用户的操作信心很重要。

如果您的 scrollView 每一页的大小是固定的，您可以直接使用 `paging` 特性实现：

```swift
scrollView.isPagingEnabled = true
```

但想必您也注意到了，Taio 的工具栏是对按钮进行分组的，这个时候我们就要自己实现分页算法。

我们第一步要做的事情，是把 scrollView 滚动降速提高，让滚动可以更快地停下来：

```swift
scrollView.decelerationRate = .fast
```

仅仅做了这一步，您都会觉得工具栏有很大的提升，因为不会疯狂滚动了。接下来我们使用下面这个代理方法让滚动能够停在精确的位置：

```swift
func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {

}
```

这里面您需要自己考虑，最佳的停留位置是哪里。对 Taio 而言，我们选择让它可以精确地停在某个分组开始的地方。

> 您可以判断 `velocity`，让用户在缓慢滚动时，还是可以停留在任何位置。

## 光标移动

您可能注意到了，Taio 的工具栏提供了一个光标移动的功能，按一下可以向前或向后移动光标。

但这是不够的，用户期待的是，按住它的时候，光标可以持续性地移动，并且移动速度会逐渐加快。就像按住删除键那样，会产生快感。

我们通过设置一个 `Timer`，配合上述的 `InputClick` 音效，在反复调整移动速度的变化方式之后，终于得到了一个很接近删除键的效果。

## 为 iPad 优化

前面我们提到了 `inputView` 的作用，这种交互无法应用在连接了外接键盘的 iPad 上面，因为键盘会被藏起来。

在这种情况下，我们会使用一个 `Popover` 来替代，像是这个样子：

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_5.png" width="360" />

> 值得注意的是，您不应该使用是否是 iPad 来判断用户所处的环境。因为 iPad 在分屏的时候，可以长得和 iPhone 差不多，而且 iPad 的键盘还可以悬停。

## Standard Edit Actions

因为 Markdown 支持粗体、斜体等样式，所以很自然地，我们希望用户也可以通过 `UIMenuController` 的方式控制格式，这可以通过 `UIResponderStandardEditActions` 来完成：

```swift
override func toggleBoldface(_ sender: Any?) {

}

override func toggleItalics(_ sender: Any?) {

}

override func toggleUnderline(_ sender: Any?) {

}
```

iOS 都帮您做好了，您只需要把已有的实现链接到这几个方法里面即可。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_6.png" width="360" />

但这产生了副作用，在 iPad 的输入栏上面，现在会出现一个多余的 BIU 按钮，这和我们工具栏上的完全重复了。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_7.png" width="360" />

没问题，我们通过覆盖 `inputAssistantItem` 的方式把它去掉：

```swift
view.inputAssistantItem.trailingBarButtonGroups = []
```

当然，如果您觉得有必要的话，也可以把它们设置成别的按钮。

## 更多内容

正如我们之前提到的那样，文本编辑绝非易事，我们也做了许多工作。

本文分享的内容仅仅是很小的一部分，请关注后续更多有趣的内容。