> [!NOTE] Dec 16, 2020

# Editor Toolbar Experience

For text editing, a well designed toolbar is essential, especially when there is no hardware keyboard connected. Taio offers a handy toolbar that can be used to type symbols, or to quickly complete some tasks:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_1.png" width="360" />

This article takes less than ten minutes to read, and we hope there are parts that will be useful to you.

## inputAccessoryView

To implement such a toolbar on iOS, we mostly use `inputAccessoryView` instead of listening to the keyboard frame changes:

```swift
textView.inputAccessoryView = UIView(...)
```

You can implement this toolbar using any `UIView`, but that's not the recommended way. To implement a native-style toolbar like many 1st-party apps by Apple, we should use `UIInputView` and provide it with the keyboard style:

```swift
textView.inputAccessoryView = UIInputView(... , inputViewStyle: .keyboard)
```

iOS will automatically provide you with the exact same style as the keyboard background, without having to manage its color yourself.

## Safe Area

When an external keyboard is being used, users can optionally hide the soft keyboard. In that case, you should take into account the bottom safe area, like this:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_2.png" width="360" />

Instead of having the `Home Indicator` cover your toolbar.

## inputView

When necessary, we may need to provide a "secondary keyboard" for the TextView, such as the symbol panel and snippet panel in Taio:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_3.png" width="360" />

This is achieved by overriding the `TextView.inputView` with:

```swift
textView.inputView = UIView(...)
textView.reloadInputViews()
```

It is worth noting that there is a very small issue here that happens when the user is using some input methods (E.g. Pinyin for Chinese).

When there are some words in the selection area of the input method, switch the keyboard to the interface implemented by `inputView` and then switch back again. At this point, the selection area will suddenly disappear and the user feels a **sudden** change in the height of the keyboard.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_4.png" width="720" />

This issue appears in the vast majority of apps, including 1st-party apps by Apple, but we didn't let it go.

We noticed that **after the user moved the cursor, the selection would suddenly come back**. So we rewrote the `setInputView` method, when an inputView change is detected, we do:

- Move the cursor programmatically (direction doesn't matter)
- Move it back

With this little trick, the user doesn't feel any sudden changes and everything is perfect.

## Input Clicks

Since the actions take place in the extended area of the keyboard, it's natural to add keyboard sounds (which the user can choose to turn off) to these actions.

`UIDevice` has a `playInputClick` method, which can be used by implementing `enableInputClicksWhenVisible`.

But there is a more simple (and stupid) approach:

```swift
AudioServicesPlaySystemSound(1104)
```

*It's pure magic.*

## Pointer Interactions

Since our app expects the user to use it on an iPad with a magic keyboard connected, it is extremely important that the buttons on the keyboard support the `Hover` effect of the trackpad.

Instead of saying too much here, you can find many WWDC sessions on the Apple developer website.

We strongly recommend: [Design for the iPadOS pointer](https://developer.apple.com/videos/play/wwdc2020/10640/).

## Better Scrolling

We use a standard `UIScrollView` for the toolbar scrolling, it works great, but we wanted to optimize the experience even further.

In short, users will expect every step to be accurate, rather than scrolling to an unexpected position, which is important to improve user confidence.

If your scrollView has a fixed page size, you can simply achieve this using the `paging` feature:

```swift
scrollView.isPagingEnabled = true
```

But as you may have noticed, Taio's toolbar groups buttons, so we'll have to implement our own paging algorithm.

Our first step is to increase the deceleration rate of the scrollView so that scrolling can stop quicker:

```swift
scrollView.decelerationRate = .fast
```

Just by doing this step, you'll feel a big improvement in the toolbar because it won't scroll like crazy anymore. After that, we use the following delegate method to fix up the target position:

```swift
func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {

}
```

You need to figure out for yourself where is the best position to stop. For Taio, we chose to stop exactly where a button group starts.

> You can check the `velocity` so that the user can scroll slowly and stop at any position.

## Cursor Movement

As you may have noticed, Taio's toolbar provides a feature that moves the cursor position forward or backward with a single tap.

But that's not enough; the user expects the cursor to move continuously and progressively faster when it's held down. Just like pressing and holding the delete key, it makes users happy.

After adjusting the way the movement speed changes so many times, we finally got an approach very close to the delete key by setting a `Timer` with the `InputClick` effect mentioned above.

## Optimize for iPad

As we mentioned before, `inputView` is great for extending the keyboard, but it cannot be applied to an iPad with an external keyboard, because the keyboard will possibly be hidden.

In this case, we'll use a `Popover` instead, like this:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_5.png" width="360" />

> It's important that you should not check whether or not it's an iPad to determine what environment the user is in. Because iPad can look pretty much like iPhone when using split views, and there's floating mode for iPad keyboard.

## Standard Edit Actions

Since Markdown supports text styles bold and italic, it's natural to control the formatting using `UIMenuController`, which can be done with `UIResponderStandardEditActions`:

```swift
override func toggleBoldface(_ sender: Any?) {

}

override func toggleItalics(_ sender: Any?) {

}

override func toggleUnderline(_ sender: Any?) {

}
```

iOS does all the work for you, you just need to link your existing implementation to these methods.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_6.png" width="360" />

As a side effect, there is now a redundant BIU button group on iPad, which is a duplicate of the one on our toolbar.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_7.png" width="360" />

Not a big problem, let's get rid of it by overriding the `inputAssistantItem` with:

```swift
view.inputAssistantItem.trailingBarButtonGroups = []
```

Of course, you can also set them to other buttons if you feel it's necessary.

## More Content

As we said before, text editing is never easy and we have done a lot of work for it.

This article is only a small part of it, stay tuned for more interesting content.