// Name: Iframe-Plus
// ID: iframeplus
// Description: Display webpages or HTML over the stage
// Context: "iframe" is an HTML element that lets websites embed other websites.
// License: MIT AND MPL-2.0

(function(Scratch) {
  "use strict";

  /** @type {Object.<string, HTMLIFrameElement>} */
  let iframes = {};
  /** @type {Object.<string, Overlay>} */
  let overlays = {};

  const featurePolicy = {
    accelerometer: "'none'",
    "ambient-light-sensor": "'none'",
    battery: "'none'",
    camera: "'none'",
    "display-capture": "'none'",
    "document-domain": "'none'",
    "encrypted-media": "'none'",
    fullscreen: "'none'",
    geolocation: "'none'",
    gyroscope: "'none'",
    magnetometer: "'none'",
    microphone: "'none'",
    midi: "'none'",
    payment: "'none'",
    "picture-in-picture": "'none'",
    "publickey-credentials-get": "'none'",
    "speaker-selection": "'none'",
    usb: "'none'",
    vibrate: "'none'",
    vr: "'none'",
    "screen-wake-lock": "'none'",
    "web-share": "'none'",
    "interest-cohort": "'none'",
  };

  const SANDBOX = [
    "allow-same-origin",
    "allow-scripts",
    "allow-forms",
    "allow-modals",
    "allow-popups",
    "allow-top-navigation",
  ];

  let x = {};
  let y = {};
  let width = {};
  let height = {};
  let interactive = {};
  let resizeBehavior = {};

  const updateFrameAttributes = (iframeID) => {
    const iframe = iframes[iframeID];
    if (!iframe) {
      return;
    }

    iframe.style.pointerEvents = interactive[iframeID] ? "auto" : "none";

    const {
      stageWidth, stageHeight
    } = Scratch.vm.runtime;
    const effectiveWidth = width[iframeID] >= 0 ? width[iframeID] : stageWidth;
    const effectiveHeight = height[iframeID] >= 0 ? height[iframeID] : stageHeight;

    if (resizeBehavior[iframeID] === "scale") {
      iframe.style.width = `${effectiveWidth}px`;
      iframe.style.height = `${effectiveHeight}px`;

      iframe.style.transform =
        `translate(${-effectiveWidth / 2 + x[iframeID]}px, ${
        -effectiveHeight / 2 - y[iframeID]
      }px)`;
      iframe.style.top = "0";
      iframe.style.left = "0";
    } else {
      // As the stage is resized in fullscreen mode, only % can be relied upon
      iframe.style.width = `${(effectiveWidth / stageWidth) * 100}%`;
      iframe.style.height = `${(effectiveHeight / stageHeight) * 100}%`;

      iframe.style.transform = "";
      iframe.style.top =
        `${
        (0.5 - effectiveHeight / 2 / stageHeight - y[iframeID] / stageHeight) * 100
      }%`;
      iframe.style.left =
        `${
        (0.5 - effectiveWidth / 2 / stageWidth + x[iframeID] / stageWidth) * 100
      }%`;
    }
  };

  const getOverlayMode = (iframeID) =>
    resizeBehavior[iframeID] === "scale" ? "scale-centered" : "manual";

  const createFrame = (iframeID, src) => {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.setAttribute("sandbox", SANDBOX.join(" "));
    iframe.setAttribute(
      "allow",
      Object.entries(featurePolicy)
      .map(([name, permission]) => `${name} ${permission}`)
      .join("; ")
    );
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("src", src);

    iframes[iframeID] = iframe;
    overlays[iframeID] = Scratch.renderer.addOverlay(iframe, getOverlayMode(iframeID));
    updateFrameAttributes(iframeID);
  };

  const closeFrame = (iframeID) => {
    if (iframes[iframeID]) {
      Scratch.renderer.removeOverlay(iframes[iframeID]);
      delete iframes[iframeID];
      delete overlays[iframeID];
    }
  };

  Scratch.vm.on("STAGE_SIZE_CHANGED", () => {
    for (const iframeID in iframes) {
      updateFrameAttributes(iframeID);
    }
  });

  Scratch.vm.runtime.on("RUNTIME_DISPOSED", () => {
    for (const iframeID in iframes) {
      closeFrame(iframeID);
    }
  });

  class IframeExtension {
    constructor() {
      this.receivedValues = {};
      window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "updateValue") {
          this.receivedValues[event.data.iframeID] = event.data.value;
        }
      });
    }
    getInfo() {
      return {
        name: "Iframe+",
        id: "iframeplus",
        blocks: [{
            opcode: "display",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] を表示 (URLから) [URL]",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://extensions.turbowarp.org/hello.html",
              },
            },
          }, {
            opcode: "displayHTML",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] を表示 (HTMLから) [HTML]",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "<h1>Hello world</h1>",
              },
            },
          },
          "---", {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] を表示する",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
            },
          }, {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] を隠す",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
            },
          }, {
            opcode: "close",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] を閉じる",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
            },
          },
          "---", {
            opcode: "get",
            blockType: Scratch.BlockType.REPORTER,
            text: "埋め込み [IFRAMEID] の [MENU]",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              MENU: {
                type: Scratch.ArgumentType.STRING,
                menu: "getMenu",
              },
            },
          }, {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] のx座標を[X]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          }, {
            opcode: "setY",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] のy座標を[Y]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          }, {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] の幅を[WIDTH]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageWidth,
              },
            },
          }, {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] の高さを[HEIGHT]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageHeight,
              },
            },
          }, {
            opcode: "setInteractive",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] の動作を[INTERACTIVE]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              INTERACTIVE: {
                type: Scratch.ArgumentType.STRING,
                menu: "interactiveMenu",
              },
            },
          }, {
            opcode: "setResize",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] のサイズ変更動作を[RESIZE]にする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              RESIZE: {
                type: Scratch.ArgumentType.STRING,
                menu: "resizeMenu",
              },
            },
          },
          "---", {
            opcode: "getValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "埋め込み [IFRAMEID] からのデータ",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
            },
          }, {
            opcode: "resetValue",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] からのデータをリセットする",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
            },
          }, {
            opcode: "sendMessageToIframe",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み [IFRAMEID] へのデータ [MESSAGE]",
            arguments: {
              IFRAMEID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "iframe1",
              },
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello, iframe!",
              },
            },
          },
          "---", {
            opcode: "getAllIframeIDs",
            blockType: Scratch.BlockType.REPORTER,
            text: "すべての埋め込みID",
          }, {
            opcode: "showAllIframes",
            blockType: Scratch.BlockType.COMMAND,
            text: "すべての埋め込みを表示する",
          }, {
            opcode: "hideAllIframes",
            blockType: Scratch.BlockType.COMMAND,
            text: "すべての埋め込みを隠す",
          }, {
            opcode: "closeAllIframes",
            blockType: Scratch.BlockType.COMMAND,
            text: "すべての埋め込みを閉じる",
          }, {
            opcode: "resetAllValues",
            blockType: Scratch.BlockType.COMMAND,
            text: "すべての埋め込みからのデータをリセットする",
          },
        ],
        menus: {
          getMenu: {
            acceptReporters: true,
            items: [
              "url",
              "visible",
              "x",
              "y",
              "width",
              "height",
              "interactive",
              "resize behavior",
            ],
          },
          interactiveMenu: {
            acceptReporters: true,
            items: [
              "true",
              "false",
            ],
          },
          resizeMenu: {
            acceptReporters: true,
            items: [{
              text: "scale",
              value: "scale",
            }, {
              text: "viewport",
              value: "viewport",
            }, ],
          },
        },
      };
    }

    sendMessageToIframe({
      IFRAMEID,
      MESSAGE
    }) {
      const iframe = iframes[IFRAMEID];
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: "fromTurboWarp",
          message: MESSAGE
        }, "*");
      }
    }

    getValue({
      IFRAMEID
    }) {
      return this.receivedValues[IFRAMEID] || "";
    }

    resetValue({
      IFRAMEID
    }) {
      this.receivedValues[IFRAMEID] = "";
    }

    async display({
      IFRAMEID,
      URL
    }) {
      closeFrame(IFRAMEID);
      if (await Scratch.canEmbed(URL)) {
        createFrame(IFRAMEID, Scratch.Cast.toString(URL));
      }
    }

    async displayHTML({
      IFRAMEID,
      HTML
    }) {
      closeFrame(IFRAMEID);
      const url =
        `data:text/html;,${encodeURIComponent(
        Scratch.Cast.toString(HTML)
      )}`;
      if (await Scratch.canEmbed(url)) {
        createFrame(IFRAMEID, url);
      }
    }

    show({
      IFRAMEID
    }) {
      const iframe = iframes[IFRAMEID];
      if (iframe) {
        iframe.style.display = "";
      }
    }

    hide({
      IFRAMEID
    }) {
      const iframe = iframes[IFRAMEID];
      if (iframe) {
        iframe.style.display = "none";
      }
    }

    close({
      IFRAMEID
    }) {
      closeFrame(IFRAMEID);
    }

    get({
      IFRAMEID,
      MENU
    }) {
      MENU = Scratch.Cast.toString(MENU);
      const iframe = iframes[IFRAMEID];
      if (MENU === "url") {
        if (iframe) return iframe.src;
        return "";
      } else if (MENU === "visible") {
        return !!iframe && iframe.style.display !== "none";
      } else if (MENU === "x") {
        return x[IFRAMEID] || 0;
      } else if (MENU === "y") {
        return y[IFRAMEID] || 0;
      } else if (MENU === "width") {
        return width[IFRAMEID] >= 0 ? width[IFRAMEID] : Scratch.vm.runtime.stageWidth;
      } else if (MENU === "height") {
        return height[IFRAMEID] >= 0 ? height[IFRAMEID] : Scratch.vm.runtime.stageHeight;
      } else if (MENU === "interactive") {
        return interactive[IFRAMEID] || true;
      } else if (MENU === "resize behavior") {
        return resizeBehavior[IFRAMEID] || "scale";
      } else {
        return "";
      }
    }

    setX({
      IFRAMEID,
      X
    }) {
      x[IFRAMEID] = Scratch.Cast.toNumber(X);
      updateFrameAttributes(IFRAMEID);
    }

    setHeight({
      IFRAMEID,
      HEIGHT
    }) {
      height[IFRAMEID] = Scratch.Cast.toNumber(HEIGHT);
      updateFrameAttributes(IFRAMEID);
    }

    setInteractive({
      IFRAMEID,
      INTERACTIVE
    }) {
      interactive[IFRAMEID] = Scratch.Cast.toBoolean(INTERACTIVE);
      updateFrameAttributes(IFRAMEID);
    }

    setResize({
      IFRAMEID,
      RESIZE
    }) {
      if (RESIZE === "scale" || RESIZE === "viewport") {
        resizeBehavior[IFRAMEID] = RESIZE;
        if (overlays[IFRAMEID]) {
          overlays[IFRAMEID].mode = getOverlayMode(IFRAMEID);
          Scratch.renderer._updateOverlays();
          updateFrameAttributes(IFRAMEID);
        }
      }
    }

    getAllIframeIDs() {
      return Object.keys(iframes);
    }

    showAllIframes() {
      for (const iframeID in iframes) {
        this.show({
          IFRAMEID: iframeID
        });
      }
    }

    hideAllIframes() {
      for (const iframeID in iframes) {
        this.hide({
          IFRAMEID: iframeID
        });
      }
    }

    closeAllIframes() {
      for (const iframeID in iframes) {
        this.close({
          IFRAMEID: iframeID
        });
      }
    }

    resetAllValues() {
      this.receivedValues = {};
    }
  }

  Scratch.extensions.register(new IframeExtension());
})(Scratch);
