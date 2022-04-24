> 在过去的几个月里，我们一直在重新思考 Apple 平台上的文本编辑体验，结果是我们放弃了所有我们创建的格式化工具栏，并用新的设计取代了它们。
  
## 格式化工具栏

这其实是我们曾经引以为豪的事情，我们甚至为此写了一篇[文章](https://dev.taio.app/#/cn/editor/toolbar)。然而它的效果并不好，现在来讲讲为什么，针对每个平台。

### iPhone

用可滚动的工具栏来显示所有格式化选项，看起来是个不错的想法，也很容易实现。但实际上，我们发现用户很难记住按钮的位置，滚动必须精确地停在某个点上，这在触摸屏上很困难。更糟糕的是，由于这种“不稳定”，用户无法训练自己形成“肌肉记忆”。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_1.png" width="360" />

我们最终通过将工具栏固定化，只在上面显示几个按钮，并将大部分的格式化选项放在二级位置（利用 [inputView](https://developer.apple.com/documentation/uikit/uiresponder/1621092-inputview)）来改善这个问题。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_28.png" width="360" />

这实际上是一种权衡，但我们认为这是值得做的。在某些情况下，需要多点击一次来触发动作，但得益于肌肉记忆，用户可以更快实现大多数动作。动作现在被有逻辑地分组了，导航的方法也更容易记住。

此外，我们还支持了最新 iOS 上的菜单，它使选项切换更容易，看起来更有原生的风格。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_29.png" width="360" />

根据观察，我们认为长按菜单经常被用户忽略，所以我们让菜单成为主要的操作，可以直接在菜单中滑动来选择一个项目，这要感谢 iOS 上新的[菜单系统](https://developer.apple.com/design/human-interface-guidelines/ios/controls/buttons/)。

### iPad

我们曾经在 iOS 和 iPadOS 上使用相同的工具栏，它的效果“还可以”，因为 iPad 通常有更宽的显示屏，没有上面提到的滚动问题。然而，iPad 上的文本编辑体验已被 Apple 重新设计，在 iPadOS 15 上有一个更简洁的浮动工具栏。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_30.png" width="720" />

使用传统基于 `inputAccessoryView` 的工具栏仍然是可行的（大多数编辑器仍在使用），但它看起来有点奇怪，而且工具栏占用了大量空间，这对大屏幕来说是一种浪费。更重要的是，它很难看，而且有很多布局相关的毛病。

这个问题的答案很早以前就被揭示了：[inputAssistantItem](https://developer.apple.com/documentation/uikit/uiresponder/1621135-inputassistantitem)，在过去的几年中，Apple 已经将其用于许多第一方应用程序，如 Notes 和 Pages。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_31.png" width="360" />

在 iPadOS 14（和没有连接外接键盘的 iPadOS 15）上，它会为原生键盘工具栏增加额外的按钮。如果您在 iPadOS 15 上使用外接键盘，它会看起来非常简洁和紧凑。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_32.png" width="360" />

对于文本格式化，我们使用一个包含常用选项的弹出式窗口，而对于图片和链接等内容的插入，我们则是依靠上述的菜单选项。它的效果非常好，非常适合 Magic Keyboard 和 Apple Pencil 等配件。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_33.png" width="360" />

### Mac

当我们最初使用 [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac_catalyst) 技术将我们的 iPad 应用移植到 Mac 上时，我们制作了一个自制的弹出窗口来复制 iOS 上 [UIMenuController](https://developer.apple.com/documentation/uikit/uimenucontroller) 的体验。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_34.png" width="360" />

很遗憾，这也是我们后悔做了的事情。这背后的原因是，它不像一个 Mac 应用程序，尽管一些知名的应用程序使用这种风格来进行富文本格式化。当我们选择一大块文本或滚动窗口时，弹出窗口总是意外地显示或隐藏。

为了解决这个问题，我们增加了对上下文菜单和状态栏菜单的支持（同时支持键盘快捷键），毕竟它们看起来更像 Mac 原生该有的体验。

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_35.png" width="360" />

## 总结

很难为所有 Apple 平台提供一个统一的解决方案，所以我们为每个平台调整了体验。我们不能说它们是完美的，但我们对目前的结果感到满意。

> [!NOTE] 2022 年 4 月 24 日