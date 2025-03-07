import colorbrewer from "colorbrewer";
import randomColor from "randomcolor";
import tinycolor from "tinycolor2";
import tinygradient from "tinygradient";

const tpl = document.querySelector("#playground-item").innerHTML;
const list = $("#colors-list");

let steps = 9;

function addColor(color) {
  color = color || randomColor();

  const item = $(tpl);
  item.find("[name=color]").val(color).colorpicker();

  list.append(item);

  computePos();
}

function computePos() {
  const pos = list.find("[name=pos]");

  pos.each(function (i) {
    this.value = i / (pos.length - 1);
  });
}

function setOutputFromPlayground() {
  const pos = list
    .find("[name=pos]")
    .map(function () {
      const val = parseFloat(this.value);
      return isNaN(val) ? undefined : val;
    })
    .get();

  const colors = list
    .find("[name=color]")
    .map(function () {
      return this.value;
    })
    .get()
    .map(function (color, i) {
      return {
        color: color,
        pos: pos[i],
      };
    });

  setOutput(colors, steps);
}

function setOutput(colors, steps) {
  let html = "";

  if (colors.length < 2) {
    html = "Not enough colors";
  } else {
    try {
      const grad = tinygradient(colors);

      // CSS
      html += `
      <li class="list-group-item"><h4>CSS reference</h4>
        <div class="out css" style="background:${grad.css()};"></div>
      </li>
      <li class="list-group-item">
        <h4>RGB interpolation</h4>
        <div class="out rgb">
      `;
      grad.rgb(steps).forEach((color) => {
        html += `
          <div style="background:${color.toRgbString()}">
            <span>${color.toHexString()}</span>
          </div>
        `;
      });
      html += `
        </div>
      </li>`;

      // RGB loop
      html += `
      <li class="list-group-item">
        <h4>RGB loop</h4>
        <div class="out rgb">`;
      grad
        .loop()
        .rgb(Math.max(steps, colors.length * 2 - 1))
        .forEach((color) => {
          html += `
          <div style="background:${color.toRgbString()}">
            <span>${color.toHexString()}</span>
          </div>`;
        });
      html += `
        </div>
      </li>`;

      // HSV
      html += `
      <li class="list-group-item">
        <h4>HSV short interpolation</h4>
        <div class="out hsv">`;
      grad.hsv(steps, "short").forEach((color) => {
        html += `
        <div style="background:${color.toRgbString()}">
          <span>${color.toHexString()}</span>
        </div>`;
      });
      html += `
        </div>
      </li>`;

      // HSV2
      html += `
      <li class="list-group-item">
        <h4>HSV long interpolation</h4>
        <div class="out hsv2">`;
      grad.hsv(steps, "long").forEach((color) => {
        html += `
        <div style="background:${color.toRgbString()}">
          <span>${color.toHexString()}</span>
        </div>`;
      });
      html += `
        </div>
      </li>`;
    } catch (error) {
      html = error;
    }
  }

  document.querySelector("#playground-output").innerHTML = html;
}

list
  .on("colorpickerChange colorpickerCreate", function (e) {
    e.colorpicker.element.css("background-color", e.color.toString());
    e.colorpicker.element.css(
      "color",
      tinycolor
        .mostReadable(e.color.toString(), ["white", "black"])
        .toHexString(),
    );
    e.colorpicker.element[0].value = e.color.toString();
    setOutputFromPlayground();
  })
  .on("change", "[name=pos]", function () {
    setOutputFromPlayground();
  })
  .on("click", '[data-dismiss="color"]', function () {
    $(this).closest("li").remove();
    computePos();
    setOutputFromPlayground();
  });

$("[name=steps]")
  .on("change input", function () {
    steps = this.value;
    setOutputFromPlayground();
  })
  .val(steps);

addColor("#FF0000");
addColor("#FF9900");
addColor("#00FF00");

////////////////////////////////////////

let cbScheme = "BuGn";
let cbSteps = 9;

function setCbOutput() {
  const colors = list
    .find("[name=color]")
    .map(function () {
      return this.value;
    })
    .get();

  let html = "";

  const cbVariant = Math.min(
    cbSteps,
    Math.max.apply(null, Object.keys(colorbrewer[cbScheme])),
  );
  const grad = tinygradient(colorbrewer[cbScheme][cbVariant]);

  html += `
  <li class="list-group-item">
    <div class="out rgb">`;
  grad.rgb(cbSteps).forEach((color) => {
    html += `
    <div style="background:${color.toRgbString()}">
      <span>${color.toHexString()}</span>
    </div>
    `;
  });
  html += `
    </div>
  </li>`;

  document.querySelector("#cb-playground-output").innerHTML = html;
}

(() => {
  let html = "";

  $.each(colorbrewer.schemeGroups, (group, schemes) => {
    html += `
    <optgroup label="${group}">
    `;
    schemes.forEach((scheme) => {
      html += `
      <option>${scheme}</option>
    `;
    });
    html += `
    </optgroup>
    `;
  });

  $("[name=cb-scheme]").html(html);
})();

$("[name=cb-scheme]")
  .on("change", function () {
    cbScheme = this.value;
    setCbOutput();
  })
  .val(cbScheme);

$("[name=cb-steps]")
  .on("change", function () {
    cbSteps = this.value;
    setCbOutput();
  })
  .val(cbSteps);

$("#add-color").on("click", () => addColor());

setCbOutput();
