/* Reusable d3 force-directed layout for darwin graphs
 * Follows the design pattern suggested by Mike Bostock:
 * http://bost.ocks.org/mike/chart/
 */

(function () {
  d3.darwin = function () {
    var width = 1000,
      height = 1000,
      skills = [],
      links = [],
      colors = {
        "nord-900": "#2e3440",
        "nord-800": "#3b4252",
        "nord-700": "#434c5e",
        "nord-600": "#4c566a",
        "nord-300": "#d8dee9",
        "nord-200": "#e5e9f0",
        "nord-100": "#eceff4",
        "nord-frost-200": "#8fbcbb",
        "nord-frost-100": "#88c0d0",
        "nord-frost-300": "#81a1c1",
        "nord-frost-400": "#5e81ac",
        "nord-red": "#bf616a",
        "nord-orange": "#d08770",
        "nord-yellow": "#ebcb8b",
        "nord-green": "#a3be8c",
        "nord-purple": "#b48ead",
      },
      canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      transform = d3.zoomIdentity,
      simulation,
      tick = () => {
        context.clearRect(0, 0, width, height);
        context.setTransform(
          transform.k,
          0,
          0,
          transform.k,
          transform.x,
          transform.y
        );
        // draw links
        for (const link of links) {
          drawLink(link);
        }
        // draw skill
        hovered = null;
        selected = null;
        for (const skill of skills) {
          drawSkill(skill);
          if (skill.hovered) {
            hovered = skill;
          }
          if (skill.selected) {
            selected = skill;
          }
        }
        // pop the transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (hovered != null) {
          writeHovered(hovered);
        }
        if (selected != null) {
          writeSelected(selected);
        }
      },
      drawLink = (link) => {
        color = colors["nord-600"];
        // checking for hovered
        if (link.source.hovered || link.target.hovered) {
          color = colors["nord-frost-100"];
        }
        context.beginPath();
        context.moveTo(link.source.x, link.source.y);
        context.lineTo(link.target.x, link.target.y);
        context.strokeStyle = color;
        context.lineWidth = 1.5 * scale();
        context.stroke();
      },
      drawSkill = (skill) => {
        // checking if skill is hovered
        radius = skill.radius;
        color = colors["nord-600"];
        if (skill.starred) {
          color = colors["nord-frost-400"];
        }
        if (skill.hovered) {
          radius = skill.radius * 1.2;
          color = colors["nord-frost-100"];
        }
        if (skill.selected) {
          color = colors["nord-yellow"];
        }
        context.beginPath();
        context.moveTo(skill.x + radius * scale(), skill.y);
        context.arc(skill.x, skill.y, radius * scale(), 0, 2 * Math.PI);
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fill();
        context.stroke();
      },
      writeHovered = (skill) => {
        // we want to write the name of the skill in the bottom right corner
        text = skill.name;
        context.font = 7 * scale() + "px monospace";
        context.fillStyle = colors["nord-300"];
        // theres a transform on the context, so we need to transform the
        // coordinates to the original coordinates
        context.fillText(
          text,
          width - 5 * scale() - context.measureText(text).width,
          height - 5 * scale()
        );
      },
      writeSelected = (skill) => {
        // we are going to write a more detailed information panel in the top
        // right corner of the screen

        context.font = 10 * scale() + "px monospace";
        context.fillStyle = colors["nord-300"];
        context.strokeStyle = colors["nord-300"];
        context.lineWidth = 0.5 * scale();

        x = 10 * scale();
        y =
          10 * scale() +
          context.measureText(skill.name).actualBoundingBoxAscent;

        // write the name of the skill
        context.fillText(skill.name, x, y);

        y = y + 5 * scale();

        // draw a line
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 100 * scale(), y);
        context.stroke();

        y = y + 7 * scale();
        context.font = 7 * scale() + "px monospace";

        // calculate skill level
        level = 0;
        for (l of skill.levels) {
          if (skill.points >= l) {
            level++;
          }
        }
        level = Math.min(level, skill.levels.length);

        // write the level
        text = skill.title + " " + level;
        y = y + context.measureText(text).actualBoundingBoxAscent;
        context.fillText(text, x, y);

        // write a progress bar
        y = y + 5 * scale();
        end_text = skill.points + "/" + skill.levels[level] + " " + skill.unit;
        progress_width = 100 * scale() - context.measureText(end_text).width;
        progress_height = 8 * scale();
        text_y = context.measureText(end_text).actualBoundingBoxAscent;
        margin_y = (progress_height - text_y) / 2;

        // draw a rectangle
        context.beginPath();
        context.rect(x, y, progress_width, progress_height);
        context.fillStyle = colors["nord-800"];
        context.fill();
        // calculate progress
        progress = skill.points / skill.levels[level];
        progress = Math.min(progress, 1);

        // draw the progress rectangle in
        context.beginPath();
        context.rect(
          x + 0.5 * scale(),
          y + 0.5 * scale(),
          Math.min(progress_width - 0.5 * scale(), progress * progress_width),
          progress_height - 0.5 * scale()
        );
        context.fillStyle = colors["nord-frost-100"];
        context.fill();

        // write end text
        context.fillStyle = colors["nord-300"];
        context.fillText(
          end_text,
          x + progress_width + 2 * scale(),
          y + text_y + margin_y
        );

        // write description
        y = y + progress_height;

        // split the description into lines

        if (skill.description) {
          y = y + 5 * scale();
          text = "Description";
          y = y + context.measureText(text).actualBoundingBoxAscent;
          context.fillText(text, x, y);
          y = y + 1 * scale();

          context.font = 6 * scale() + "px monospace";
          words = skill.description.split(" ");
          lines = [];
          max_width = 100 * scale();
          line = "";
          for (word of words) {
            if (context.measureText(line + " " + word).width > max_width) {
              lines.push(line);
              line = word;
            } else {
              if (line == "") {
                line = word;
              } else {
                line = line + " " + word;
              }
            }
          }
          lines.push(line);
          // write the description
          for (line of lines) {
            y = y + 4 * scale();
            y = y + context.measureText(line).actualBoundingBoxAscent;
            context.fillText(line, x, y);
          }
        }
      }, // end writeSelected
      scale = () => {
        return (2.5 * width * height) / (1920 * 1080);
      },
      click = (event) => {
        // iterate over all nodes to find the one that was clicked
        // this is slow and janky
        // todo we could use https://www.datamake.io/blog/d3-canvas-full
        // the above to do something more performatn

        // apply the inverse of the current transform to the click
        // coordinates to get the coordinates in the original coordinate
        // system
        x = (event.offsetX - transform.x) / transform.k;
        y = (event.offsetY - transform.y) / transform.k;
        for (const skill of skills) {
          if (
            Math.abs(skill.x - x) < skill.radius * scale() &&
            Math.abs(skill.y - y) < skill.radius * scale()
          ) {
            // found the node
            // call skill click handler
            onSkillClick(skill);
            break;
          }
        }
        tick();
      },
      hover = (event) => {
        // iterate over all nodes to find if any are hovered
        // this is slow and janky
        // see the onClickHander

        // apply the inverse of the current transform to the click
        // coordinates to get the coordinates in the original coordinate
        // system
        x = (event.offsetX - transform.x) / transform.k;
        y = (event.offsetY - transform.y) / transform.k;

        for (const skill of skills) {
          if (
            Math.abs(skill.x - x) < skill.radius * scale() &&
            Math.abs(skill.y - y) < skill.radius * scale()
          ) {
            // found the node
            skill.hovered = true;
            // change the cursor
            canvas.style.cursor = "pointer";
            onSkillHover(skill);
            break;
          } else {
            skill.hovered = false;
            canvas.style.cursor = "default";
          }
        }
        tick();
      },
      onSkillClick = (skill) => {
        for (s of skills) {
          s.selected = false;
        }
        skill.selected = true;
      },
      onSkillHover = (skill) => {};

    function my() {
      // compute links
      links = [];
      for (const s of skills) {
        for (const p of s.parents) {
          links.push({ source: p, target: s.id });
        }
      }

      // we are using d3 v7 now
      // generate the force layout
      simulation = d3
        .forceSimulation(skills)
        .force(
          "link",
          d3
            .forceLink(links)
            .id(function (d) {
              return d.id;
            })
            .distance(30 * scale())
        )
        .force("charge", d3.forceManyBody().strength(-10 * scale()))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collide",
          d3.forceCollide().radius(() => 5 * scale())
        )
        .on("tick", tick);

      d3.select(canvas)
        .on("click", click)
        .on("mousemove", hover)
        .call(
          d3.zoom().on("zoom", (t) => {
            transform = t.transform;
            tick();
          })
        );
    }
    // getter and setters for variables defined above
    my.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      canvas.width = width;
      return my;
    };

    my.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      canvas.height = height;
      return my;
    };

    my.skills = function (value) {
      if (!arguments.length) return skills;
      skills = value;
      for (const skill of skills) {
        skill.radius = 5;
        skill.hovered = false;
        skill.selected = false;
      }
      return my;
    };

    my.canvas = function (value) {
      if (!arguments.length) return canvas;
      canvas = value;
      canvas.width = width;
      canvas.height = height;
      canvas.style.background = colors["nord-900"];
      context = canvas.getContext("2d");
      return my;
    };

    return my;
  }; // end of darwin
})();
