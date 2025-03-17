// Name: Iframe-Plus
// ID: iframeplus
// Description: Display webpages or HTML over the stage
// Context: "iframe" is an HTML element that lets websites embed other websites.
// License: MIT AND MPL-2.0

(function(Scratch) {
  "use strict";

  /** @type {HTMLIFrameElement|null} */
  let iframe = null;
  let overlay = null;

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

  let x = 0;
  let y = 0;
  let width = -1; // negative means default
  let height = -1; // negative means default
  let interactive = true;
  let resizeBehavior = "scale";

  const updateFrameAttributes = () => {
    if (!iframe) {
      return;
    }

    iframe.style.pointerEvents = interactive ? "auto" : "none";

    const {
      stageWidth, stageHeight
    } = Scratch.vm.runtime;
    const effectiveWidth = width >= 0 ? width : stageWidth;
    const effectiveHeight = height >= 0 ? height : stageHeight;

    if (resizeBehavior === "scale") {
      iframe.style.width = `${effectiveWidth}px`;
      iframe.style.height = `${effectiveHeight}px`;

      iframe.style.transform =
        `translate(${-effectiveWidth / 2 + x}px, ${
        -effectiveHeight / 2 - y
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
        (0.5 - effectiveHeight / 2 / stageHeight - y / stageHeight) * 100
      }%`;
      iframe.style.left =
        `${
        (0.5 - effectiveWidth / 2 / stageWidth + x / stageWidth) * 100
      }%`;
    }
  };

  const getOverlayMode = () =>
    resizeBehavior === "scale" ? "scale-centered" : "manual";

  const createFrame = (src) => {
    iframe = document.createElement("iframe");
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

    overlay = Scratch.renderer.addOverlay(iframe, getOverlayMode());
    updateFrameAttributes();
  };

  const closeFrame = () => {
    if (iframe) {
      Scratch.renderer.removeOverlay(iframe);
      iframe = null;
      overlay = null;
    }
  };

  Scratch.vm.on("STAGE_SIZE_CHANGED", updateFrameAttributes);

  Scratch.vm.runtime.on("RUNTIME_DISPOSED", closeFrame);

  class IframeExtension {
    constructor() {
      this.receivedValue = "";
      window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "updateValue") {
          this.receivedValue = event.data.value;
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
            text: "埋め込み(URLから) [URL]",
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://extensions.turbowarp.org/hello.html",
              },
            },
          }, {
            opcode: "displayHTML",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込み(HTMLから) [HTML]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "<h1>Hello world</h1>",
              },
            },
          },
          "---", {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みを表示する",
          }, {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みを隠す",
          }, {
            opcode: "close",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みを閉じる",
          },
          "---", {
            opcode: "get",
            blockType: Scratch.BlockType.REPORTER,
            text: "埋め込みの[MENU]",
            arguments: {
              MENU: {
                type: Scratch.ArgumentType.STRING,
                menu: "getMenu",
              },
            },
          }, {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みのx座標を[X]にする",
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          }, {
            opcode: "setY",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みのy座標を[Y]にする",
            arguments: {
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          }, {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みの幅を[WIDTH]にする",
            arguments: {
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageWidth,
              },
            },
          }, {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みの高さを[HEIGHT]にする",
            arguments: {
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageHeight,
              },
            },
          }, {
            opcode: "setInteractive",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みの動作を[INTERACTIVE]にする",
            arguments: {
              INTERACTIVE: {
                type: Scratch.ArgumentType.STRING,
                menu: "interactiveMenu",
              },
            },
          }, {
            opcode: "setResize",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みのサイズ変更動作を[RESIZE]にする",
            arguments: {
              RESIZE: {
                type: Scratch.ArgumentType.STRING,
                menu: "resizeMenu",
              },
            },
          },
          "---", {
            opcode: "getValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "埋め込みからのデータ",
          }, {
            opcode: "resetValue",
            blockType: Scratch.BlockType.COMMAND,
            text: "埋め込みからのデータをリセットする",
          }, {
			opcode: "sendMessageToIframe",
			blockType: Scratch.BlockType.COMMAND,
			text: "埋め込みへのデータ [MESSAGE]",
			arguments: {
		      MESSAGE: {
			    type: Scratch.ArgumentType.STRING,
				defaultValue: "Hello, iframe!",
			  },
			},
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
              // The getter blocks will return English regardless of translating these
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
	
	sendMessageToIframe({ MESSAGE }) {
	  if (iframe && iframe.contentWindow) {
	    iframe.contentWindow.postMessage({ type: "fromTurboWarp", message: MESSAGE }, "*");
	  }
	}
	  
    getValue() {
      return this.receivedValue;
    }

    resetValue() {
      this.receivedValue = "";
    }

    async display({
      URL
    }) {
      closeFrame();
      if (await Scratch.canEmbed(URL)) {
        createFrame(Scratch.Cast.toString(URL));
      }
    }

    async displayHTML({
      HTML
    }) {
      closeFrame();
      const url =
        `data:text/html;,${encodeURIComponent(
        Scratch.Cast.toString(HTML)
      )}`;
      if (await Scratch.canEmbed(url)) {
        createFrame(url);
      }
    }

    show() {
      if (iframe) {
        iframe.style.display = "";
      }
    }

    hide() {
      if (iframe) {
        iframe.style.display = "none";
      }
    }

    close() {
      closeFrame();
    }

    get({
      MENU
    }) {
      MENU = Scratch.Cast.toString(MENU);
      if (MENU === "url") {
        if (iframe) return iframe.GetAttribute("src");
        return "";
      } else if (MENU === "visible") {
        return !!iframe && iframe.style.display !== "none";
      } else if (MENU === "x") {
        return x;
      } else if (MENU === "y") {
        return y;
      } else if (MENU === "width") {
        return width >= 0 ? width : Scratch.vm.runtime.stageWidth;
      } else if (MENU === "height") {
        return height >= 0 ? height : Scratch.vm.runtime.stageHeight;
      } else if (MENU === "interactive") {
        return interactive;
      } else if (MENU === "resize behavior") {
        return resizeBehavior;
      } else {
        return "";
      }
    }

    setX({
      X
    }) {
      x = Scratch.Cast.toNumber(X);
      updateFrameAttributes();
    }

    setY({
      Y
    }) {
      y = Scratch.Cast.toNumber(Y);
      updateFrameAttributes();
    }

    setWidth({
      WIDTH
    }) {
      width = Scratch.Cast.toNumber(WIDTH);
      updateFrameAttributes();
    }

    setHeight({
      HEIGHT
    }) {
      height = Scratch.Cast.toNumber(HEIGHT);
      updateFrameAttributes();
    }

    setInteractive({
      INTERACTIVE
    }) {
      interactive = Scratch.Cast.toBoolean(INTERACTIVE);
      updateFrameAttributes();
    }

    setResize({
      RESIZE
    }) {
      if (RESIZE === "scale" || RESIZE === "viewport") {
        resizeBehavior = RESIZE;
        if (overlay) {
          overlay.mode = getOverlayMode();
          Scratch.renderer._updateOverlays();
          updateFrameAttributes();
        }
      }
    }
  }

  Scratch.extensions.register(new IframeExtension());
})(Scratch);
