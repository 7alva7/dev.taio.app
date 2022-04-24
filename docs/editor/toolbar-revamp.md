> Over the past few months, we have been rethinking text editing experience on Apple platforms, the outcome was that we abandoned all the formatting toolbars we created and replaced them with new designs.
  
## Formatting Toolbars

It is actually something we used to be proud of, we even wrote an [article](https://dev.taio.app/#/editor/toolbar) about it. However, it didn't work very well, and we are telling you why, for each platform.

### iPhone

It looks good to have a scrollable toolbar that shows all formatting options, but in reality, we find that it's hard for users to remember the position, and they must stop at some point precisely, it makes their life hard on a touch screen. Even worse, with this kind of "instability", users cannot train themselves to leverage "muscle memory".

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_1.png" width="360" />

We ended up improving this by making the toolbar fixed, showing only a few buttons on it, and making most of the formatting options secondary (by utilizing [inputView](https://developer.apple.com/documentation/uikit/uiresponder/1621092-inputview)).

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_28.png" width="360" />

This is actually a trade-off, but we think it's worth making. In some cases, it takes one more tap to trigger the action, but users can achieve most actions even faster because of the magic of muscle memory, actions are now logically grouped and the method to navigate is easier to remember.

Also, we leveraged the modern menus on the latest iOS, it makes option switching easier, with an even more native-looking style.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_29.png" width="360" />

Based on observations, we think that long-press menus are often "hidden" to users, so we made the menu the primary action, and they can just swipe through the menu to select an item, thanks to the new [menu system](https://developer.apple.com/design/human-interface-guidelines/ios/controls/buttons/) on iOS.

### iPad

We used to have the same toolbar on both iOS and iPadOS, it worked "okay" since iPad typically has a wider display, there is no scrolling issues as mentioned above. However, the text editing experience on the iPad has been redesigned by Apple to have a cleaner floating toolbar on iPadOS 15.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_30.png" width="720" />

It is still possible to use the legacy `inputAccessoryView` based toolbar (which is still used by most editors), but it looks a bit strange and takes up a lot of space by the toolbar, which is a waste of the large screen. More importantly, it is ugly and buggy.

The answer to this issue was revealed a long time ago: [inputAssistantItem](https://developer.apple.com/documentation/uikit/uiresponder/1621135-inputassistantitem), Apple has been using it for many 1st-party apps, such as Notes and Pages, over the past few years.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_31.png" width="360" />

On iPadOS 14 (and iPadOS 15 without an external keyboard attached), it adds additional buttons to the native keyboard toolbar. If you are using an external keyboard on iPadOS 15, here's what it looks like, it's super compact and neat.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_32.png" width="360" />

For text formatting, we use a popover-style window that contains frequently used options, and for content insertion like images and links, we are relying on pull-down menus as mentioned above. It works very well and is perfect for accessories like Magic Keyboard and Apple Pencil.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_33.png" width="360" />

### Mac

When we originally moved our iPad app to Mac using [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac_catalyst), we replicated the [UIMenuController](https://developer.apple.com/documentation/uikit/uimenucontroller) experience on iOS by making a home-made popup window.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_34.png" width="360" />

This is something we regret doing, too. The reason behind this is that it doesn't feel like a Mac app, some well-known apps use this style for rich-text formatting though. When we select a big chunk of text or scroll the window, the popup window always shows or hides unexpectedly.

To solve this, we added support for both context menu and status bar menu (with keyboard shortcuts support), as they look much more "Mac-like".

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_35.png" width="360" />

## Conclusion

It's hard to have a unified solution for all Apple platforms, so we tweaked the experience for each of them. We cannot say they are perfect, but we are satisfied with the results so far.

> [!NOTE] April 24, 2022