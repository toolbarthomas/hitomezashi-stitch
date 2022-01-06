class Hitomezashi {
  constructor(props) {
    const {
      context,
      dimension,
      dpi,
      id,
      lineCap,
      lineWidth,
      namespace,
      offset,
      preventRender,
      size,
      stitchings,
    } = props;

    // Should be used to prevent naming collisions.
    this.namespace = namespace || this.constructor.name;

    // Renders the actual canvas within the selected context.
    this.context = document.querySelector(context) ? context : document.body;

    // Defines the matching logic for the true or false state within each
    // stitch.
    this.defaultStringPattern = ["a", "e", "i", "o", "u"];

    // Defines the initial state for the matching defaultStringPattern property.
    this.defaultStringState = "off";

    // Contains the defined values as stitches for the current instance.
    this.stitchings = this.defineStitchings(stitchings);

    this.lineCap = lineCap === "round" ? lineCap : "square";
    this.lineWidth = lineWidth || 4;

    // Should contain the default Screen DPI that is used for the web.
    this.defaultDPI = 72;

    // Adjusts the defined pixel values within the optional DPI value.
    this.dpi = dpi || this.defaultDPI;

    // The fallback width and height size for  the actual render.
    this.defaultSize = 500;

    // Defines the probability to ignore the default state.
    this.offset = offset || 1;

    this.size = this.useDPI(size || this.defaultSize / 25);

    // Defines the width for the defined canvas.
    this.w = this.stitchings[1].pattern.length * this.size;

    // @TODO can be removed.
    // this.width = this.useDPI(width || this.defaultSize);

    // Defines the height for the defined canvas.
    this.h = this.stitchings[0].pattern.length * this.size;

    // @TODO can be removed.
    // this.height = this.useDPI(height || this.defaultSize);

    // Should contain the defined HTMLCanvasElement for the given Hitomezashi
    // instance.
    this.canvas = this.defineCanvas(id, context);

    // Stores the generated path to export the current render as XML.
    this.xml = [];

    if (!preventRender) {
      this.render();
    }
  }

  /**
   * Defines the canvas that will display the actual Hitomezashi drawing.
   *
   * @param {string} id
   * @param {HTMLElement} context Defines the canvas from another HTMLElement.
   * @returns
   */
  defineCanvas(id) {
    const initialCanvas = document.getElementById(id);
    let canvas;

    if (initialCanvas && initialCanvas.tagNAME.toLocaleLowerCase === "canvas") {
      canvas = initialCanvas;
      this.id = id;
    } else {
      canvas = document.createElement("canvas");

      canvas.id = this.generateID();

      this.context.appendChild(canvas);

      this.id = canvas.id;
    }

    canvas.width = this.w - this.size * 2;
    canvas.height = this.h - this.size * 2;

    return canvas;
  }

  /**
   * Defines the actual Hitomezashi pattern for the given stich value.
   *
   * @param {string|string[]} value
   */
  definePattern(value) {
    let commit = [];

    if (typeof value === "string") {
      if (this.defaultStringState === "on") {
        commit.push(
          ...value
            .split("")
            .map((char) => (this.defaultStringPattern.includes(char) ? 1 : 0))
        );
      } else {
        commit.push(
          ...value
            .split("")
            .map((char) => (this.defaultStringPattern.includes(char) ? 0 : 1))
        );
      }
    } else if (Array.isArray(value)) {
      value
        .split(" ")
        .join("")
        .forEach((v) =>
          commit.push(v === true || v === "true" || v === 1 ? 1 : 0)
        );
    }

    return commit;
  }

  /**
   * Creates a new Stitch Object for the defined instance.
   *
   * @param {string} stitch
   * @returns
   */
  defineStitch(stitch) {
    return {
      pattern: this.definePattern(stitch),
      value: stitch,
    };
  }

  /**
   * Transforms the given values as one or multiple Stitch objects.
   *
   * @param {any[]} stitchings The value to transform.
   *
   * @returns {Stitch[]} Returns one or multiple Stitch objects.
   */
  defineStitchings(stitchings) {
    let commit = [];

    if (Array.isArray(stitchings)) {
      commit.push(...stitchings.map((stitch) => this.defineStitch(stitch)));
    } else {
      commit.push(this.defineStitch(stitchings));
    }

    return commit;
  }

  /**
   * Alias for the Browser console method.
   *
   * @param {string} message The message to output.
   */
  error(...message) {
    if (console && console.error) {
      console.error(...message);
    }
  }

  /**
   * Outputs the running instance information.
   *
   * @param {string} name Ouput the existing instance property only.
   */
  info(name) {
    if (this[name]) {
      console.log(this[name]);
    } else {
      console.log(this);
    }
  }

  /**
   * Generates an unique ID for the given instance.
   */
  generateID() {
    let id = `${this.namespace}-${Math.random().toString(36).substr(2, 9)}`;

    if (document.getElementById(id)) {
      id = this.generateID();
    }

    return id;
  }

  /**
   * Renders the actual Hitomezashi pattern within the defined canvas.
   */
  render() {
    if (!this.canvas || !this.canvas.getContext) {
      this.error(
        "Unable to define pattern, the canvas features are not supported by your Browser."
      );
      return;
    }

    const ctx = this.canvas.getContext("2d");
    ctx.lineCap = this.lineCap;
    ctx.lineWidth = this.lineWidth;

    // Draw the actual lines
    this.stitchings.forEach((stitch, index) => {
      const { pattern } = stitch;

      let x = -this.size / 2;
      let y = -this.size / 2;
      const length =
        index === 0 ? this.w / this.size + 2 : this.h / this.size + 2;

      pattern.forEach((str) => {
        if (index === 0) {
          if (this.offset === false || this.offset <= 0) {
            x = str ? -this.size / 2 : this.size / 2;
          } else {
            x =
              str && Math.random() < this.offset
                ? -this.size / 2
                : this.size / 2;
          }
          // x = str && Math.random() < this.offset ? 0 : this.size;
          // x += (this.size / 2) * 3 * row;
        } else {
          // return;
          if (this.offset === false || this.offset <= 0) {
            y = str ? -this.size / 2 : this.size / 2;
          } else {
            y =
              str && Math.random() < this.offset
                ? -this.size / 2
                : this.size / 2;
          }
          // y = str && Math.random() < this.offset ? 0 : this.size;
        }

        for (let i = 0; i < length; i += 1) {
          let d = ``;

          if (x + this.size > this.w - this.size) {
            continue;
          }

          if (y + this.size > this.h - this.size) {
            continue;
          }

          ctx.beginPath();
          ctx.moveTo(x, y);

          d += `M ${x},${y} `;

          if (index === 0) {
            x += this.size;
          } else {
            y += this.size;
          }

          ctx.lineTo(x, y);

          d += `L ${x}, ${y} `;

          // if (index === 0) {
          // } else {
          //   ctx.lineTo(x, y);
          // }

          ctx.stroke();

          ctx.closePath();

          d += `z`;

          if (index === 0) {
            x += this.size;
          } else {
            y += this.size;
          }

          this.xml.push(d);
        }

        if (index === 0) {
          y += this.size;
        } else {
          x += this.size;
        }
      });
    });
  }

  /**
   * Renders the current defined Hitmezashi Stitch.
   *
   * @returns {SVGGElement} The rendered display as SVG element.
   */
  toSVG() {
    if (this.canvas) {
      return `
        <svg
          width="${this.w - this.size * 2}" height="${this.h - this.size * 2}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-width="${this.lineWidth}"
            stroke-line-cap="${this.lineCap}"
            fill="none"
            stroke="currentColor"
            d="${this.xml.join(" ")}"
          />
        </svg>
      `;
    }
  }

  /**
   * Converts the value within the defined DPI pixel value.
   */
  useDPI(v) {
    if (isNaN(parseFloat(v))) {
      return;
    }

    return (v / this.defaultDPI) * this.dpi;
  }
}
