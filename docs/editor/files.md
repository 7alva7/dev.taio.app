# Modern File Apps

Taio's Markdown editor is based on a completely open file system, which provides the basis for cross-app collaboration as well as convenient data transmission, this article will cover some key points to be aware of when developing such an app.

Of course, we are assuming that your goal is to be a good citizen on iOS and contribute to the great ecosystem. If your direction is to create private files or formats, this article won't be very helpful to you.

## File Sharing

Early iOS didn't have the foundation for these great features until Apple released the [Files App](https://support.apple.com/en-us/HT206481), and a bunch of APIs made for file sharing.

The Files app provides a unified interface for shared documents, and developers can expose the `Documents` directory to the Files app by enabling `UIFileSharingEnabled` in `Info.plist`.

```xml
<key>UIFileSharingEnabled</key>
<true/>
```

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_8.png" width="360">

## iCloud Drive

The `Documents` directory mentioned above is local. iOS also offers a cloud storage service called `iCloud Drive`, there're a number of advantages:

- iCloud account based, no need to create user system, no additional logins for users
- Seamless integration with existing file management APIs
- Uses the user's iCloud quota, developers don't have to pay for it

So, when it comes to creating document synchronization on iOS, iCloud Drive is the way to go.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_9.png" width="360">

It's also simple to use - just assign an iCloud Container to your app, and then use [FileManager](https://developer.apple.com/documentation/foundation/filemanager) to get the path:

```swift
let url = FileManager.default.url(forUbiquityContainerIdentifier: nil)
```

Your code needs to handle cases where `url` is `nil`, such as when the user is not logged into iCloud, or when the app is not granted iCloud Drive access.

> When permission changes, iOS will post an [NSUbiquityIdentityDidChange](https://developer.apple.com/documentation/foundation/nsnotification/name/1407629-nsubiquityidentitydidchange) notification, which can be observed in order to handle interface changes.

## File Provider

The above two solutions provide Files app support for local files and iCloud files respectively, but still cannot handle the case where the file is in other locations. For example, apps that support app extensions may store files in a [Shared Container](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html) to make sure both the main app and app extensions can access.

For this case, we can create [File Provider Extension](https://developer.apple.com/documentation/fileprovider) to provide files to the Files app.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_10.png" width="360">

File Provider APIs are fairly straightforward, we recommend taking [ish](https://ish.app/) app's [File Provider](https://github.com/ish-app/ish/tree/master/app/FileProvider ) as a complete example, so we won't go over it here.

> In addition, your app can also support [File Provider UI Extension](https://developer.apple.com/documentation/fileproviderui), which provides custom actions for the Files app.

## Document types

Apps can register supported document types in the `Info.plist` file, for example:

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

This allows you to receive files shared via AirDrop or Share Sheet and then handle them using the methods associated with `AppDelegate` or `SceneDelegate` (Multiple Windows).

To make the experience even better, we can support importing folders, not just single files:

```xml
<dict>
  <key>CFBundleTypeName</key>
  <string>Folder</string>
  <key>CFBundleTypeOSTypes</key>
  <array>
    <string>fold</string>
  </array>
  <key>CFBundleTypeRole</key
  <string>Viewer</string>
  <key>LSHandlerRank</key>
  <string>Default</string>
  <key>LSItemContentTypes</key>
  <array>
    <string>public.folder</string>
  </array>
</dict>
```

> Taio allows the user to save imported folders to a location.

## Exported Type Identifiers

Other than receiving files, apps can also define exclusive file types. For example, Taio's action is essentially a JSON file, which we define as `taioactions`:

```xml
<dict>
  <key>UTypeConformsTo</key>
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

Users can see the type description and other apps can register this type as supported:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_11.png" width="360">

> The above `FileTypeTaioActionsDescription` is the key to the localizable string.

## UIDocumentBrowserViewController

If your app is fully document-based, using a [UIDocumentBrowserViewController](https://developer.apple.com/documentation/uikit/uidocumentbrowserviewcontroller) might be a good way to go, and Apple's [iWork](https://www.apple.com/iwork/) suite is implemented this way.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_12.png" width="360">

Taio wasn't implemented like that, because we wanted more UI flexibility, but Apple's [documentation](https://developer.apple.com/documentation/uikit/view_controllers/adding_a_document_browser_to_your_app) explicitly states:

> Always assign the document browser as your app's root view controller. Don't place the document browser in a navigation controller, tab bar, or split view, and don't present the document browser modally.

Also, if you need to open the document picker within the app, you should use [UIDocumentPickerViewController](https://developer.apple.com/documentation/uikit/uidocumentpickerviewcontroller) instead of UIDocumentBrowserViewController.

For more information about this part, you can refer to the open source project [textor](https://github.com/louisdh/textor).

## Open in Place

We've mentioned the way to import external files, which creates a copy of the file to your app. `Open in Place` is the opposite, it allows you to open files from other apps and edit the original file directly.

Just add a key in `Info.plist` as below:

```xml
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
```

Similar to the document sharing, you need to implement some methods in `SceneDelegate`, and `UIOpenURLContext` tells you if it is open-in-place:

```swift
if context.options.openInPlace {

}
```

Apps that need to access open-in-place files need to take care of two methods of [URL](https://developer.apple.com/documentation/foundation/url):

- [startAccessingSecurityScopedResource](https://developer.apple.com/documentation/foundation/url/1779698-startaccessingsecurityscopedreso)
- [stopAccessingSecurityScopedResource](https://developer.apple.com/documentation/foundation/url/1780153-stopaccessingsecurityscopedresou)

Also, with open-in-place support, long pressing the app icon on iPad will show recently opened files:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_13.png" width="360">

> The author of the [Working Copy](https://docs.taio.app/#/cn/integration/working-copy) app have created a great [demo project](https://github.com/palmin/open-in-place) for open-in-place, which is recommended for reference.

## File Bookmarks

The [bookmarkData](https://developer.apple.com/documentation/foundation/url/2143023-bookmarkdata) API is not new:

```swift
let bookmarkData = try url.bookmarkData()
```

You can use it to store recently opened files, and use `resolvingBookmarkData` to retrieve the path:

```swift
let url = try URL(
  resolvingBookmarkData: data,
  bookmarkDataIsStale: &bookmarkIsStale
)
```

Even if a file is moved, we can still retrieve it correctly. More importantly, file bookmarks can be used to store open-in-place URLs.

Or, store a file or directory opened with `UIDocumentPickerViewController` so that it can be accessed at any time.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_14.png" width="360">

Taio supports this feature, so users can edit linked third-party files in Taio at any time.

## UIDocument

[UIDocument](https://developer.apple.com/documentation/uikit/uidocument) provides some wrappers for documents, allowing developers to more easily handle file opening, saving, and state changes, take the above mentioned [textor](https://github.com/louisdh/textor) project for some examples, and we want to explain conflict handling a little bit.

Conflict is very common for multi-editor or multi-app editing scenarios. We may edit a file in client A and client B at the same time, and then multiple copies are created on a device.

[NSFileVersion](https://developer.apple.com/documentation/foundation/nsfileversion) provides a way to get conflict versions:

```swift
let versions = NSFileVersion.unresolvedConflictVersionsOfItem(at: url)
```

According to [Apple's documentation](https://developer.apple.com/library/archive/documentation/DataManagement/Conceptual/DocumentBasedAppPGiOS/ResolveVersionConflicts/ResolveVersionConflicts.html), the app can decide a strategy for conflicts resolving, such as always using the latest version. However, Taio is a text editor, we believe it would be a better idea to let the user compare the differences:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_15.png" width="360">

This way, users are always confident about what have changed, the same logic is used for Taio's local history feature.

## TextBundle

The [TextBundle](http://textbundle.org/) format defines as an open specification to standardize file sharing across apps.

A TextBundle directory contains metadata and a text file, as well as an `assets` folder for images.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_16.png" width="360">

With this format, documents and their referenced resources can be packaged into a single file and shared across apps that support TextBundle.

You can refer to the [specification](http://textbundle.org/spec/) of TextBundle to learn how to implement it, or take a look the [TextBundle](https://github.com/shinyfrog/TextBundle) open source project.

> The above project is also an example of [FileWrapper](https://developer.apple.com/documentation/foundation/filewrapper).

## Trashing

Instead of removing files directly, apps can also use the `trashItem` method of FileManager:

```swift
try FileManager.default.trashItem(at: url, resultingItemURL: &resultingURL)
```

Files removed by this method will be moved to the `Recently Deleted` folder in the Files app and can be restored by the user. This method essentially creates a `.Trash` hidden directory for the file and will automatically handle naming issues.

## More Content

As we can see, it's not easy to make a file based app great, Taio has done a lot of work, and there's lots of room to improve.

Apple offers a lot of tutorials for document apps, such as [Document Based Apps](https://developer.apple.com/document-based-apps/), as well as a series of related sessions presented at WWDC that are recommended for further exploring.

Last but not least, thanks to all the third-party content referenced in this article for their contributions to the ecosystem.

> [!NOTE] Dec 24, 2020