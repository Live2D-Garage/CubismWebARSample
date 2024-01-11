# Cubism WebAR Sample

Cubism WebAR Sample is sample project that combines [Live2D Cubism SDK for Web] and [AR.js] to display Live2D model output from [Live2D Cubism Editor] on AR marker via webcam.

This application runs on a web browser. This makes it easy to enjoy AR content in a browser without installing an application.

You can display your Live2D models just by replacing model data, and you can use your own AR marker.
You can promote your Live2D models by embedding AR marker in business cards or posters.

Additionally, in the two-shot mode, which does not use markers, you can take pictures with the Live2D model.

[Live2D Cubism SDK for Web]: https://www.live2d.com/download/cubism-sdk/
[AR.js]: https://github.com/jeromeetienne/AR.js/
[Live2D Cubism Editor]: https://www.live2d.com/

Read this in other languages: [English](README.md), [日本語](README.ja.md).

![Demo](/docs/imgs/demo.png)


## License

See [LICENSE.md](LICENSE.md).


## Recommended environment

| | Android | iPhone, iPad | PC |
| --- | --- | --- | --- |
| OS | Android 7.0 or higher | iOS 11 or higher | Windows or macOS |
| Browser | Google Chrome | Safari | Google Chrome |


## Documents (Japanese)

* [Quick start](/docs/QuickStart.md)
* [AR marker guideline](/docs/ARMarker.md)
* [Development guideline](/docs/Development.md)
* [Trouble Shooting](/docs/TroubleShooting.md)


## Known bugs

* The eye tracking function does not work correctly depending on the value of scale item in model setting file
  * Eye tracking function is disabled in `/src/lappdefine.ts`
* The display position of model changes between normal display and billboarding display
* The display size of model changes depending on aspect ratio of device screen


## Directory structure

```
.
├─ assets           # Resource files
│  ├─ css           # Style files
│  ├─ data          # AR.js camera data file
│  └─ models        # Live2D model files and AR.js marker file
├─ CubismWebSamples # Cubism SDK for Web (Git submodule)
├─ docs             # Document files about this application
├─ lib              # Third party files
├─ script           # Autorun scripts
└─ src              # Source code files
```


## Third party

| Name | Version |
| --- | --- |
| [AR.js] | 2.0.8 |
