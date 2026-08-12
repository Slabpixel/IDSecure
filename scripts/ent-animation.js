/**
 * Enterprise site animations — nav, scroll sections, hover interactions.
 * Each block is self-contained; early-return if its DOM nodes are absent.
 */
(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // Shared utilities
  // --------------------------------------------------------------------------

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }

  var ENT_NAV_OFFSET = 72;
  var ENT_PIN_START = "top top+=" + ENT_NAV_OFFSET;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // --------------------------------------------------------------------------
  // Navigation — desktop dropdown hover
  // --------------------------------------------------------------------------

  (function initEntNav() {
    var entNavDesktopMq = window.matchMedia("(min-width: 1025px)");
    var entNavDropToggle = document.querySelectorAll(".ent-nav-item--dropdown");

    entNavDropToggle.forEach(function (item) {
      var entDropMenu = item.querySelector(".ent-nav-dropdown");
      var trigger = item.querySelector(".ent-nav-link");
      if (!entDropMenu || !trigger) {
        return;
      }

      var mouseIsOver = false;

      function mouseState() {
        if (!entNavDesktopMq.matches) {
          entDropMenu.classList.remove("ent-nav-hover-active");
          return;
        }
        if (mouseIsOver) {
          entDropMenu.classList.add("ent-nav-hover-active");
        } else {
          entDropMenu.classList.remove("ent-nav-hover-active");
        }
      }

      trigger.addEventListener("mouseenter", function () {
        mouseIsOver = true;
        mouseState();
      });
      trigger.addEventListener("mouseleave", function () {
        mouseIsOver = false;
        mouseState();
      });
      entDropMenu.addEventListener("mouseenter", function () {
        mouseIsOver = true;
        mouseState();
      });
      entDropMenu.addEventListener("mouseleave", function () {
        mouseIsOver = false;
        mouseState();
      });
      trigger.addEventListener("click", function (e) {
        if (!entNavDesktopMq.matches) {
          e.preventDefault();
        }
      });
    });
  })();

  // --------------------------------------------------------------------------
  // Navigation — mobile menu
  // --------------------------------------------------------------------------

  (function initEntMobileNav() {
    var siteNav = document.querySelector(".ent-site-navigation");
    if (!siteNav) {
      return;
    }

    var navBtn = siteNav.querySelector(".ent-nav-btn");
    var navMobile = siteNav.querySelector(".ent-nav-mobile");
    if (!navBtn || !navMobile) {
      return;
    }

    function resetMobileGroups() {
      navMobile
        .querySelectorAll(".ent-nav-mobile-group.is-open")
        .forEach(function (group) {
          group.classList.remove("is-open");
          var collapse = group.querySelector(".ent-nav-mobile-panel-collapse");
          var trigger = group.querySelector(".ent-nav-mobile-trigger");
          if (collapse) {
            collapse.style.maxHeight = "";
          }
          if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
          }
        });
    }

    function syncCollapseHeight(group, open) {
      var collapse = group.querySelector(".ent-nav-mobile-panel-collapse");
      if (!collapse) {
        return;
      }

      if (open) {
        collapse.style.maxHeight = collapse.scrollHeight + "px";
        return;
      }

      collapse.style.maxHeight = collapse.scrollHeight + "px";
      requestAnimationFrame(function () {
        collapse.style.maxHeight = "0";
      });
    }

    function setMenuOpen(open) {
      navBtn.classList.toggle("is-active", open);
      navMobile.classList.toggle("is-open", open);
      siteNav.classList.toggle("is-menu-open", open);
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
      navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      navMobile.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";

      if (!open) {
        resetMobileGroups();
      }
    }

    navBtn.addEventListener("click", function () {
      setMenuOpen(!navMobile.classList.contains("is-open"));
    });

    navMobile
      .querySelectorAll(".ent-nav-mobile-trigger")
      .forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var group = trigger.closest(".ent-nav-mobile-group");
          if (!group) {
            return;
          }

          var isOpen = !group.classList.contains("is-open");

          navMobile
            .querySelectorAll(".ent-nav-mobile-group.is-open")
            .forEach(function (openGroup) {
              if (openGroup === group) {
                return;
              }
              openGroup.classList.remove("is-open");
              syncCollapseHeight(openGroup, false);
              var openTrigger = openGroup.querySelector(
                ".ent-nav-mobile-trigger",
              );
              if (openTrigger) {
                openTrigger.setAttribute("aria-expanded", "false");
              }
            });

          group.classList.toggle("is-open", isOpen);
          trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
          syncCollapseHeight(group, isOpen);
        });
      });

    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });
  })();

  // --------------------------------------------------------------------------
  // Homepage — mobile accordions (use cases + industries)
  // --------------------------------------------------------------------------

  (function initEntHomepageMobile() {
    var mobileMq = window.matchMedia("(max-width: 768px)");

    var usecasesList = document.querySelector(".ent-usecases-mobile_list");
    if (usecasesList) {
      var usecaseItems = usecasesList.querySelectorAll(
        ".ent-usecases-mobile_item",
      );

      function setUsecaseActive(item) {
        usecaseItems.forEach(function (el) {
          var isActive = el === item;
          el.classList.toggle("is-active", isActive);

          var trigger = el.querySelector(".ent-usecases-mobile_trigger");
          var panel = el.querySelector(".ent-usecases-mobile_panel");

          if (trigger) {
            trigger.setAttribute("aria-expanded", isActive ? "true" : "false");
          }
          if (panel) {
            if (isActive) {
              panel.removeAttribute("hidden");
            } else {
              panel.setAttribute("hidden", "");
            }
          }
        });
      }

      function syncUsecases() {
        if (!mobileMq.matches) {
          return;
        }

        if (
          !usecasesList.querySelector(".ent-usecases-mobile_item.is-active")
        ) {
          setUsecaseActive(usecaseItems[0]);
        }
      }

      usecaseItems.forEach(function (item) {
        var trigger = item.querySelector(".ent-usecases-mobile_trigger");
        if (!trigger) {
          return;
        }

        trigger.addEventListener("click", function () {
          if (!mobileMq.matches) {
            return;
          }
          if (item.classList.contains("is-active")) {
            return;
          }
          setUsecaseActive(item);
        });
      });

      mobileMq.addEventListener("change", syncUsecases);
      syncUsecases();
    }

    var industriesList = document.querySelector(".ent-industries-mobile_list");
    if (industriesList) {
      var industryItems = industriesList.querySelectorAll(
        ".ent-industries-mobile_item",
      );

      function setIndustryActive(item) {
        industryItems.forEach(function (el) {
          var isActive = item && el === item;
          el.classList.toggle("is-active", isActive);
          el.setAttribute("aria-expanded", isActive ? "true" : "false");

          var panel = el.querySelector(".ent-industries-mobile_panel");

          if (panel) {
            if (isActive) {
              panel.removeAttribute("hidden");
            } else {
              panel.setAttribute("hidden", "");
            }
          }
        });
      }

      industryItems.forEach(function (item) {
        item.setAttribute("aria-expanded", "false");

        item.addEventListener("click", function (event) {
          if (!mobileMq.matches) {
            return;
          }

          if (event.target.closest("a")) {
            return;
          }

          var isActive = item.classList.contains("is-active");
          if (isActive) {
            setIndustryActive(null);
            return;
          }

          setIndustryActive(item);
        });
      });
    }
  })();

  // --------------------------------------------------------------------------
  // Operating model blocks — one active background on hover
  // --------------------------------------------------------------------------

  (function initEntBlockHover() {
    var wrap = document.querySelector(".ent-block_wrap");
    if (!wrap) {
      return;
    }

    var items = wrap.querySelectorAll(".ent-block_item");
    if (!items.length) {
      return;
    }

    function setActive(item) {
      items.forEach(function (el) {
        el.classList.toggle("is-active", el === item);
      });
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        setActive(item);
      });
    });
  })();

  // --------------------------------------------------------------------------
  // IoT featured use cases — expandable strip with vertical labels
  // --------------------------------------------------------------------------

  (function initEntIotUseCases() {
    var wrap = document.querySelector(".ent-iot_use-cases");
    if (!wrap) {
      return;
    }

    var items = wrap.querySelectorAll(".ent-iot_use-cases-item");
    if (!items.length) {
      return;
    }

    var desktopMq = window.matchMedia("(min-width: 1025px)");

    function setActive(item) {
      items.forEach(function (el) {
        var isActive = el === item;
        el.classList.toggle("is-active", isActive);
        el.setAttribute("aria-expanded", isActive ? "true" : "false");

        var vertical = el.querySelector(
          ".ent-iot_use-cases-item-label--vertical",
        );
        var horizontal = el.querySelector(
          ".ent-iot_use-cases-item-label--horizontal",
        );

        if (vertical) {
          vertical.setAttribute("aria-hidden", isActive ? "true" : "false");
        }
        if (horizontal) {
          horizontal.setAttribute("aria-hidden", isActive ? "false" : "true");
        }
      });
    }

    function onItemActivate(item) {
      if (!desktopMq.matches) {
        return;
      }
      setActive(item);
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        onItemActivate(item);
      });
      item.addEventListener("focus", function () {
        onItemActivate(item);
      });
    });

    if (desktopMq.matches) {
      var initial =
        wrap.querySelector(".ent-iot_use-cases-item.is-active") || items[0];
      setActive(initial);
    }
  })();

  (function initEntUsecasesMenu() {
    var menu =
      document.querySelector(".ent-usecases_menu-desktop") ||
      document.querySelector(".ent-usecases_menu");
    if (!menu) {
      return;
    }

    var items = menu.querySelectorAll(".ent-usecases_menu-list-item");
    var images = menu.querySelectorAll(".ent-usecases_menu-image-item");

    if (!items.length || items.length !== images.length) {
      return;
    }

    var desktopMq = window.matchMedia("(min-width: 1025px)");

    function setActive(item) {
      var index = Array.prototype.indexOf.call(items, item);

      items.forEach(function (el, i) {
        el.classList.toggle("is-active", i === index);
      });

      images.forEach(function (el, i) {
        el.classList.toggle("is-active", i === index);
      });
    }

    function onItemActivate(item) {
      if (!desktopMq.matches) {
        return;
      }
      setActive(item);
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        onItemActivate(item);
      });

      item.addEventListener("focus", function () {
        onItemActivate(item);
      });

      item.addEventListener("click", function (event) {
        if (!desktopMq.matches) {
          return;
        }
        event.preventDefault();
      });
    });

    if (desktopMq.matches) {
      var initial =
        menu.querySelector(".ent-usecases_menu-list-item.is-active") ||
        items[0];
      setActive(initial);
    }
  })();

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  // --------------------------------------------------------------------------
  // Resources — pinned section + horizontal list scrub
  // --------------------------------------------------------------------------

  (function initEntResourcesScroll() {
    var section = document.querySelector(".ent-resources-section");
    if (!section) {
      return;
    }

    var root = section.querySelector(".ent-resources");
    var viewport = section.querySelector(".ent-resources_viewport");
    var list = section.querySelector(".ent-resources_list");
    var progressBar = section.querySelector(".ent-resources_progress");
    var progressFill = section.querySelector(".ent-resources_progress-fill");

    if (!root || !viewport || !list || !progressBar || !progressFill) {
      return;
    }

    var mm = gsap.matchMedia();
    var scrollTween = null;
    var mobileViewportHandler = null;

    function getScrollDistance() {
      return Math.max(0, list.scrollWidth - viewport.clientWidth);
    }

    function setProgress(progress) {
      var value = Math.max(0, Math.min(1, progress));
      progressFill.style.width = value * 100 + "%";
      progressBar.setAttribute(
        "aria-valuenow",
        String(Math.round(value * 100)),
      );
    }

    function getProgressFromScrollLeft() {
      var distance = getScrollDistance();
      if (distance <= 0) {
        return 0;
      }
      return viewport.scrollLeft / distance;
    }

    function killDesktop() {
      if (scrollTween) {
        if (scrollTween.scrollTrigger) {
          scrollTween.scrollTrigger.kill();
        }
        scrollTween.kill();
        scrollTween = null;
      }

      gsap.set(list, { clearProps: "transform" });
    }

    function killMobile() {
      if (mobileViewportHandler) {
        viewport.removeEventListener("scroll", mobileViewportHandler);
        mobileViewportHandler = null;
      }
    }

    function onMobileViewportScroll() {
      setProgress(getProgressFromScrollLeft());
    }

    mm.add("(prefers-reduced-motion: reduce)", function () {
      killDesktop();
      killMobile();
      setProgress(0);
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        killMobile();

        scrollTween = gsap.to(list, {
          x: function () {
            return -getScrollDistance();
          },
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "ENT_PIN_START",
            end: function () {
              return "+=" + getScrollDistance();
            },
            pin: section,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: function (self) {
              setProgress(self.progress);
            },
          },
        });

        var onResize = debounce(function () {
          ScrollTrigger.refresh();
        }, 200);
        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
          setProgress(0);
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killDesktop();
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        killDesktop();
        killMobile();
        setProgress(0);

        return function () {
          killMobile();
        };
      },
    );
  })();

  // --------------------------------------------------------------------------
  // Solutions — clip-path reveals + nav sync (homepage + solutions page)
  // --------------------------------------------------------------------------

  (function initEntSolutionsScroll() {
    var sections = document.querySelectorAll(".ent-solutions-section");
    if (!sections.length) {
      return;
    }

    var hiddenClip = "inset(0% 100% 0% 0%)";
    var visibleClip = "inset(0% 0% 0% 0%)";
    var stepDuration = 0.4;
    var stepSpacing = 0.5;

    function isOverviewLayout(section) {
      return (
        section.classList.contains("ent-solutions-section--overview") ||
        section.dataset.solutionsLayout === "overview"
      );
    }

    function getSolutionsGrid(section) {
      return (
        section.querySelector(".ent-content_grid-three") ||
        section.querySelector(".ent-content_grid-usecase") ||
        section.querySelector(".ent-content_grid") ||
        section.querySelector(".ent-solutions")
      );
    }

    function getPinTrigger(section) {
      if (isOverviewLayout(section)) {
        return section;
      }

      return getSolutionsGrid(section);
    }

    function getPinRoot(section) {
      if (isOverviewLayout(section)) {
        return section;
      }

      return getSolutionsGrid(section);
    }

    function isMediaOnlyLayout(section, copyItems) {
      return (
        section.dataset.solutionsLayout === "media-only" ||
        section.classList.contains("ent-solutions-section--media-only") ||
        copyItems.length === 0
      );
    }

    function measureCopyItems(copyItems) {
      var max = 0;

      copyItems.forEach(function (item) {
        var prev = {
          clipPath: item.style.clipPath,
          position: item.style.position,
          visibility: item.style.visibility,
          height: item.style.height,
          inset: item.style.inset,
          pointerEvents: item.style.pointerEvents,
        };

        item.style.clipPath = "none";
        item.style.position = "relative";
        item.style.visibility = "hidden";
        item.style.height = "auto";
        item.style.inset = "auto";
        item.style.pointerEvents = "none";

        max = Math.max(max, item.offsetHeight);

        item.style.clipPath = prev.clipPath;
        item.style.position = prev.position;
        item.style.visibility = prev.visibility;
        item.style.height = prev.height;
        item.style.inset = prev.inset;
        item.style.pointerEvents = prev.pointerEvents;
      });

      return max;
    }

    function syncOverviewHeights(section) {
      if (!isOverviewLayout(section)) {
        return;
      }

      var copyWrap = section.querySelector(".ent-solutions_copy.alt");
      var copyItems = gsap.utils.toArray(
        section.querySelectorAll(".ent-solutions_copy-item"),
      );
      var center = section.querySelector(".ent-solution-center");
      var media = section.querySelector(".ent-solutions_media");
      var sideAlt = section.querySelector(".ent-solution-side.alt");
      var sideNav = section.querySelector(".ent-solution-side:not(.alt)");
      var pagination = section.querySelector(".ent-solutions_pagination");
      var grid = section.querySelector(".ent-content_grid-three");

      if (!copyWrap || !copyItems.length) {
        return;
      }

      copyWrap.style.height = "auto";
      copyItems.forEach(function (item) {
        item.style.height = "auto";
      });

      if (center) {
        center.style.minHeight = "";
      }
      if (sideAlt) {
        sideAlt.style.minHeight = "";
      }
      if (sideNav) {
        sideNav.style.minHeight = "";
      }
      if (grid) {
        grid.style.minHeight = "";
      }

      var copyMax = measureCopyItems(copyItems);
      var paginationHeight = pagination ? pagination.offsetHeight : 0;
      var sideGap = sideAlt
        ? parseFloat(getComputedStyle(sideAlt).gap) || 0
        : 0;
      var rightColumnHeight = paginationHeight + sideGap + copyMax;
      var mediaHeight = media ? media.offsetHeight : 0;
      var rowHeight = Math.max(mediaHeight, rightColumnHeight);

      copyWrap.style.height = copyMax + "px";
      copyItems.forEach(function (item) {
        item.style.height = "100%";
      });

      if (center) {
        center.style.minHeight = rowHeight + "px";
      }
      if (sideAlt) {
        sideAlt.style.minHeight = rowHeight + "px";
      }
      if (sideNav) {
        sideNav.style.minHeight = rowHeight + "px";
      }
      if (grid) {
        grid.style.minHeight = rowHeight + "px";
      }
    }

    function resetOverviewHeights(section) {
      if (!isOverviewLayout(section)) {
        return;
      }

      var copyWrap = section.querySelector(".ent-solutions_copy.alt");
      var copyItems = section.querySelectorAll(".ent-solutions_copy-item");
      var center = section.querySelector(".ent-solution-center");
      var sideAlt = section.querySelector(".ent-solution-side.alt");
      var sideNav = section.querySelector(".ent-solution-side:not(.alt)");
      var grid = section.querySelector(".ent-content_grid-three");

      if (copyWrap) {
        copyWrap.style.height = "";
      }

      copyItems.forEach(function (item) {
        item.style.height = "";
      });

      [center, sideAlt, sideNav, grid].forEach(function (node) {
        if (node) {
          node.style.minHeight = "";
        }
      });
    }

    function initSolutionsSection(section) {
      var pinTrigger = getPinTrigger(section);
      var pinRoot = getPinRoot(section);

      if (!pinTrigger || !pinRoot) {
        return null;
      }

      var mediaItems = gsap.utils.toArray(
        section.querySelectorAll(".ent-solutions_media-item"),
      );
      var copyItems = gsap.utils.toArray(
        section.querySelectorAll(".ent-solutions_copy-item"),
      );
      var navItems = gsap.utils.toArray(
        section.querySelectorAll(".ent-solution_navigation-item"),
      );
      var paginationItems = gsap.utils.toArray(
        section.querySelectorAll(".ent-solutions_pagination-item"),
      );
      var mediaOnly = isMediaOnlyLayout(section, copyItems);
      var count = mediaItems.length;

      if (!count || !navItems.length || navItems.length !== count) {
        return null;
      }

      if (!mediaOnly && copyItems.length !== count) {
        return null;
      }

      var timeline = null;

      mediaItems.forEach(function (item, index) {
        item.style.zIndex = String(index + 1);
      });

      if (!mediaOnly) {
        copyItems.forEach(function (item, index) {
          item.style.zIndex = String(index + 1);
        });
      }

      function setActiveNav(index) {
        var activeIndex = Math.max(0, Math.min(index, navItems.length - 1));

        navItems.forEach(function (item, i) {
          item.classList.toggle("is-active", i === activeIndex);
        });

        paginationItems.forEach(function (item, i) {
          item.classList.toggle("is-active", i === activeIndex);
        });
      }

      function setStaticState(index) {
        var activeIndex = Math.max(0, Math.min(index, count - 1));

        mediaItems.forEach(function (item, i) {
          item.style.clipPath = i <= activeIndex ? visibleClip : hiddenClip;
        });

        if (!mediaOnly) {
          copyItems.forEach(function (item, i) {
            item.style.clipPath = i === activeIndex ? visibleClip : hiddenClip;
          });
        }

        setActiveNav(activeIndex);
      }

      function killTimeline() {
        if (timeline) {
          if (timeline.scrollTrigger) {
            timeline.scrollTrigger.kill();
          }
          timeline.kill();
          timeline = null;
        }

        gsap.killTweensOf(mediaItems);
        gsap.killTweensOf(copyItems);
      }

      function getScrollDistance() {
        return Math.round(window.innerHeight * 1.5);
      }

      function buildTimeline() {
        syncOverviewHeights(section);

        gsap.set(mediaItems, {
          clipPath: function (i) {
            return i === 0 ? visibleClip : hiddenClip;
          },
        });

        if (!mediaOnly) {
          gsap.set(copyItems, {
            clipPath: function (i) {
              return i === 0 ? visibleClip : hiddenClip;
            },
          });
        }

        setActiveNav(0);

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: pinTrigger,
            start: ENT_PIN_START,
            end: function () {
              return "+=" + getScrollDistance();
            },
            pin: pinRoot,
            pinSpacing: true,
            scrub: 0.5,
            anticipatePin: isOverviewLayout(section) ? 0 : 1,
            invalidateOnRefresh: true,
            onUpdate: function (self) {
              var index = Math.min(
                count - 1,
                Math.floor(self.progress * count),
              );
              setActiveNav(index);
            },
          },
        });

        var step;
        for (step = 1; step < count; step++) {
          var position = (step - 1) * stepSpacing;

          timeline.to(
            mediaItems[step],
            {
              clipPath: visibleClip,
              duration: stepDuration,
              ease: "none",
            },
            position,
          );

          if (!mediaOnly) {
            timeline.to(
              copyItems[step - 1],
              {
                clipPath: hiddenClip,
                duration: stepDuration,
                ease: "none",
              },
              position,
            );

            timeline.to(
              copyItems[step],
              {
                clipPath: visibleClip,
                duration: stepDuration,
                ease: "none",
              },
              position,
            );
          }
        }

        navItems.forEach(function (item, index) {
          item.addEventListener("click", function (event) {
            event.preventDefault();
            var st = timeline && timeline.scrollTrigger;
            if (!st || count <= 1) {
              return;
            }

            var progress = index / (count - 1);
            var scrollPos = st.start + progress * (st.end - st.start);
            st.scroll(scrollPos);
          });
        });
      }

      return {
        killTimeline: killTimeline,
        setStaticState: setStaticState,
        buildTimeline: buildTimeline,
        syncOverviewHeights: function () {
          syncOverviewHeights(section);
        },
        resetOverviewHeights: function () {
          resetOverviewHeights(section);
        },
      };
    }

    var instances = [];

    sections.forEach(function (section) {
      var instance = initSolutionsSection(section);
      if (instance) {
        instances.push(instance);
      }
    });

    if (!instances.length) {
      return;
    }

    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", function () {
      instances.forEach(function (instance) {
        instance.killTimeline();
        instance.resetOverviewHeights();
        instance.setStaticState(0);
      });
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        instances.forEach(function (instance) {
          instance.buildTimeline();
        });

        var onResize = debounce(function () {
          instances.forEach(function (instance) {
            instance.syncOverviewHeights();
          });
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
        });

        return function () {
          window.removeEventListener("resize", onResize);
          instances.forEach(function (instance) {
            instance.killTimeline();
            instance.resetOverviewHeights();
          });
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        instances.forEach(function (instance) {
          instance.killTimeline();
          instance.resetOverviewHeights();
          instance.setStaticState(0);
        });
        return function () {};
      },
    );
  })();

  // --------------------------------------------------------------------------
  // SenseHQ device ecosystem — pinned scroll + fade transitions
  // --------------------------------------------------------------------------

  (function initEntSenseDeviceScroll() {
    var section = document.querySelector(".ent-sense-device-section");
    if (!section) {
      return;
    }

    var mediaItems = gsap.utils.toArray(
      section.querySelectorAll(".ent-sense_device-media-item"),
    );
    var copyItems = gsap.utils.toArray(
      section.querySelectorAll(".ent-sense_device-copy-item"),
    );
    var navItems = gsap.utils.toArray(
      section.querySelectorAll(".ent-solution_navigation-item"),
    );
    var paginationItems = gsap.utils.toArray(
      section.querySelectorAll(".ent-solutions_pagination-item"),
    );
    var count = mediaItems.length;
    var stepDuration = 0.4;
    var stepSpacing = 0.5;
    var timeline = null;

    if (!count || copyItems.length !== count || navItems.length !== count) {
      return;
    }

    function measureCopyItems(items) {
      var max = 0;

      items.forEach(function (item) {
        var prev = {
          position: item.style.position,
          visibility: item.style.visibility,
          height: item.style.height,
          inset: item.style.inset,
          opacity: item.style.opacity,
          pointerEvents: item.style.pointerEvents,
        };

        item.style.position = "relative";
        item.style.visibility = "hidden";
        item.style.height = "auto";
        item.style.inset = "auto";
        item.style.opacity = "1";
        item.style.pointerEvents = "none";

        max = Math.max(max, item.offsetHeight);

        item.style.position = prev.position;
        item.style.visibility = prev.visibility;
        item.style.height = prev.height;
        item.style.inset = prev.inset;
        item.style.opacity = prev.opacity;
        item.style.pointerEvents = prev.pointerEvents;
      });

      return max;
    }

    function syncHeights() {
      var copyWrap = section.querySelector(".ent-sense_device-copy");
      var center = section.querySelector(".ent-sense_device-center");
      var media = section.querySelector(".ent-sense_device-media");
      var sideAlt = section.querySelector(".ent-sense_device-side.alt");
      var sideNav = section.querySelector(".ent-sense_device-side:not(.alt)");
      var pagination = section.querySelector(".ent-solutions_pagination");
      var grid = section.querySelector(".ent-sense_device");

      if (!copyWrap || !copyItems.length) {
        return;
      }

      copyWrap.style.height = "auto";
      copyItems.forEach(function (item) {
        item.style.height = "auto";
      });

      [center, sideAlt, sideNav, grid].forEach(function (node) {
        if (node) {
          node.style.minHeight = "";
        }
      });

      var copyMax = measureCopyItems(copyItems);
      var paginationHeight = pagination ? pagination.offsetHeight : 0;
      var sideGap = sideAlt
        ? parseFloat(getComputedStyle(sideAlt).gap) || 0
        : 0;
      var rightColumnHeight = paginationHeight + sideGap + copyMax;
      var mediaHeight = media ? media.offsetHeight : 0;
      var rowHeight = Math.max(mediaHeight, rightColumnHeight);

      copyWrap.style.height = copyMax + "px";
      copyItems.forEach(function (item) {
        item.style.height = "100%";
      });

      [center, sideAlt, sideNav, grid].forEach(function (node) {
        if (node) {
          node.style.minHeight = rowHeight + "px";
        }
      });
    }

    function resetHeights() {
      var copyWrap = section.querySelector(".ent-sense_device-copy");
      var center = section.querySelector(".ent-sense_device-center");
      var sideAlt = section.querySelector(".ent-sense_device-side.alt");
      var sideNav = section.querySelector(".ent-sense_device-side:not(.alt)");
      var grid = section.querySelector(".ent-sense_device");

      if (copyWrap) {
        copyWrap.style.height = "";
      }

      copyItems.forEach(function (item) {
        item.style.height = "";
      });

      [center, sideAlt, sideNav, grid].forEach(function (node) {
        if (node) {
          node.style.minHeight = "";
        }
      });
    }

    function setActiveNav(index) {
      var activeIndex = Math.max(0, Math.min(index, navItems.length - 1));

      navItems.forEach(function (item, i) {
        item.classList.toggle("is-active", i === activeIndex);
      });

      paginationItems.forEach(function (item, i) {
        item.classList.toggle("is-active", i === activeIndex);
      });
    }

    function setStaticState(index) {
      var activeIndex = Math.max(0, Math.min(index, count - 1));

      mediaItems.forEach(function (item, i) {
        item.style.opacity = i === activeIndex ? "1" : "0";
      });

      copyItems.forEach(function (item, i) {
        item.style.opacity = i === activeIndex ? "1" : "0";
      });

      setActiveNav(activeIndex);
    }

    function killTimeline() {
      if (timeline) {
        if (timeline.scrollTrigger) {
          timeline.scrollTrigger.kill();
        }
        timeline.kill();
        timeline = null;
      }

      gsap.killTweensOf(mediaItems);
      gsap.killTweensOf(copyItems);
    }

    function getScrollDistance() {
      return Math.round(window.innerHeight * 0.4 * count);
    }

    function buildTimeline() {
      syncHeights();

      mediaItems.forEach(function (item, index) {
        item.style.zIndex = String(index + 1);
      });

      gsap.set(mediaItems, {
        opacity: function (i) {
          return i === 0 ? 1 : 0;
        },
      });

      gsap.set(copyItems, {
        opacity: function (i) {
          return i === 0 ? 1 : 0;
        },
      });

      setActiveNav(0);

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: ENT_PIN_START,
          end: function () {
            return "+=" + getScrollDistance();
          },
          pin: section,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var index = Math.min(count - 1, Math.floor(self.progress * count));
            setActiveNav(index);
          },
        },
      });

      var step;
      for (step = 1; step < count; step++) {
        var position = (step - 1) * stepSpacing;

        timeline.to(
          mediaItems[step - 1],
          {
            opacity: 0,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );

        timeline.to(
          mediaItems[step],
          {
            opacity: 1,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );

        timeline.to(
          copyItems[step - 1],
          {
            opacity: 0,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );

        timeline.to(
          copyItems[step],
          {
            opacity: 1,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );
      }

      navItems.forEach(function (item, index) {
        item.addEventListener("click", function (event) {
          event.preventDefault();
          var st = timeline && timeline.scrollTrigger;
          if (!st || count <= 1) {
            return;
          }

          var progress = index / (count - 1);
          var scrollPos = st.start + progress * (st.end - st.start);
          st.scroll(scrollPos);
        });
      });
    }

    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", function () {
      killTimeline();
      resetHeights();
      setStaticState(0);
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        buildTimeline();

        var onResize = debounce(function () {
          syncHeights();
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killTimeline();
          resetHeights();
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        killTimeline();
        resetHeights();
        setStaticState(0);
        return function () {};
      },
    );
  })();

  // --------------------------------------------------------------------------
  // Solution layers — pinned cards + image fade (solutions page)
  // --------------------------------------------------------------------------

  (function initEntSolutionLayersScroll() {
    var section = document.querySelector(".ent-solution-layers-section");
    if (!section) {
      return;
    }

    var cards = gsap.utils.toArray(
      section.querySelectorAll(".ent-solution-layers_cards-item"),
    );
    var images = gsap.utils.toArray(
      section.querySelectorAll(".ent-solution-layers_image-item"),
    );

    if (!cards.length || cards.length !== images.length) {
      return;
    }

    var mm = gsap.matchMedia();
    var scrollTrigger = null;

    function setActive(index) {
      var activeIndex = Math.max(0, Math.min(index, cards.length - 1));

      cards.forEach(function (item, i) {
        item.classList.toggle("is-active", i === activeIndex);
      });

      images.forEach(function (item, i) {
        item.classList.toggle("is-active", i === activeIndex);
      });
    }

    function getActiveIndex(progress) {
      return Math.min(cards.length - 1, Math.floor(progress * cards.length));
    }

    function getScrollDistance() {
      return Math.round(window.innerHeight * 1.5);
    }

    function setPinActive(isActive) {
      section.classList.toggle("is-pin-active", isActive);
    }

    function killScrollTrigger() {
      if (scrollTrigger) {
        scrollTrigger.kill();
        scrollTrigger = null;
      }
      setPinActive(false);
    }

    function createScrollTrigger() {
      killScrollTrigger();
      setActive(0);

      scrollTrigger = ScrollTrigger.create({
        id: "ent-solution-layers-pin",
        trigger: section,
        start: "bottom-=100px bottom",
        end: function () {
          return "+=" + getScrollDistance();
        },
        pin: section,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          setActive(getActiveIndex(self.progress));
        },
        onEnter: function () {
          setPinActive(true);
        },
        onEnterBack: function () {
          setPinActive(true);
        },
        onLeave: function () {
          setPinActive(false);
        },
        onLeaveBack: function () {
          setPinActive(false);
        },
        onKill: function () {
          setPinActive(false);
        },
      });

      cards.forEach(function (card, index) {
        card.addEventListener("click", function () {
          if (!scrollTrigger || cards.length <= 1) {
            return;
          }

          var progress = index / (cards.length - 1);
          var scrollPos =
            scrollTrigger.start +
            progress * (scrollTrigger.end - scrollTrigger.start);
          scrollTrigger.scroll(scrollPos);
        });
      });
    }

    mm.add("(prefers-reduced-motion: reduce)", function () {
      killScrollTrigger();
      setActive(0);
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        var onResize = debounce(function () {
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
          createScrollTrigger();
          ScrollTrigger.refresh();
          setActive(0);
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killScrollTrigger();
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        killScrollTrigger();
        setActive(0);
        return function () {};
      },
    );
  })();

  // --------------------------------------------------------------------------
  // Industries — horizontal scroll + cursor (register before How it works)
  // --------------------------------------------------------------------------

  (function initEntIndustriesScroll() {
    var section = document.querySelector(".ent-industries-section");
    if (!section) {
      return;
    }

    var viewport = section.querySelector(".ent-industries_viewport");
    var list = section.querySelector(".ent-industries_wrap");
    var cursor = section.querySelector(".ent-industries_cursor");
    var cursorScale =
      cursor && cursor.querySelector(".ent-industries_cursor-scale");
    var items = gsap.utils.toArray(
      section.querySelectorAll(".ent-industries_item"),
    );

    if (!viewport || !list || !cursor || !cursorScale || !items.length) {
      return;
    }

    document.body.appendChild(cursor);

    var mm = gsap.matchMedia();
    var scrollTween = null;
    var cursorQuickX = null;
    var cursorQuickY = null;
    var hoveredItem = null;
    var viewportMoveHandler = null;
    var cursorVisible = false;

    var scaleInEase = "elastic.out(1, 0.45)";
    var scaleOutEase = "power2.inOut";

    function getScrollDistance() {
      return Math.max(0, list.scrollWidth - viewport.clientWidth);
    }

    function setPinActive(isActive) {
      section.classList.toggle("is-pin-active", isActive);
    }

    function killDesktopScroll() {
      if (scrollTween) {
        if (scrollTween.scrollTrigger) {
          scrollTween.scrollTrigger.kill();
        }
        scrollTween.kill();
        scrollTween = null;
      }

      gsap.set(list, { clearProps: "transform" });
      setPinActive(false);
    }

    function showCursorScale() {
      gsap.killTweensOf(cursorScale);
      gsap.set(cursor, { visibility: "visible" });
      cursor.setAttribute("aria-hidden", "false");

      gsap.fromTo(
        cursorScale,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.55,
          ease: scaleInEase,
          overwrite: true,
        },
      );
    }

    function hideCursorScale() {
      gsap.killTweensOf(cursorScale);

      gsap.to(cursorScale, {
        scale: 0,
        duration: 0.3,
        ease: scaleOutEase,
        overwrite: true,
        onComplete: function () {
          gsap.set(cursor, { visibility: "hidden" });
          cursor.setAttribute("aria-hidden", "true");
        },
      });
    }

    function clearHover() {
      if (!cursorVisible) {
        return;
      }

      cursorVisible = false;

      if (hoveredItem) {
        hoveredItem.classList.remove("is-hovered");
        hoveredItem = null;
      }

      hideCursorScale();
    }

    function setHover(item) {
      var href = item.getAttribute("data-href");
      if (!href) {
        return;
      }

      if (hoveredItem && hoveredItem !== item) {
        hoveredItem.classList.remove("is-hovered");
      }

      hoveredItem = item;
      item.classList.add("is-hovered");
      cursor.href = href;

      if (!cursorVisible) {
        cursorVisible = true;
        showCursorScale();
      }
    }

    function killCursorFollow() {
      cursorVisible = false;
      gsap.killTweensOf(cursorScale);

      if (hoveredItem) {
        hoveredItem.classList.remove("is-hovered");
        hoveredItem = null;
      }

      gsap.set(cursorScale, { scale: 0 });
      gsap.set(cursor, { visibility: "hidden" });
      cursor.setAttribute("aria-hidden", "true");

      if (viewportMoveHandler) {
        viewport.removeEventListener("mousemove", viewportMoveHandler);
        viewport.removeEventListener("mouseleave", clearHover);
        viewportMoveHandler = null;
      }

      items.forEach(function (item) {
        if (item._entIndustriesClick) {
          item.removeEventListener("click", item._entIndustriesClick);
          delete item._entIndustriesClick;
        }
      });

      cursorQuickX = null;
      cursorQuickY = null;
    }

    function initCursorFollow() {
      killCursorFollow();

      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        visibility: "hidden",
        force3D: true,
      });
      gsap.set(cursorScale, { scale: 0, transformOrigin: "50% 50%" });

      cursorQuickX = gsap.quickTo(cursor, "x", {
        duration: 0.16,
        ease: "power3.out",
      });
      cursorQuickY = gsap.quickTo(cursor, "y", {
        duration: 0.16,
        ease: "power3.out",
      });

      viewportMoveHandler = function (event) {
        cursorQuickX(event.clientX);
        cursorQuickY(event.clientY);

        var target = document.elementFromPoint(event.clientX, event.clientY);
        var item = target && target.closest(".ent-industries_item");

        if (item && viewport.contains(item)) {
          setHover(item);
          return;
        }

        clearHover();
      };

      viewport.addEventListener("mousemove", viewportMoveHandler);
      viewport.addEventListener("mouseleave", clearHover);

      items.forEach(function (item) {
        var onClick = function () {
          var href = item.getAttribute("data-href");
          if (href) {
            window.location.href = href;
          }
        };

        item._entIndustriesClick = onClick;
        item.addEventListener("click", onClick);
      });
    }

    mm.add("(prefers-reduced-motion: reduce)", function () {
      killDesktopScroll();
      killCursorFollow();
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        initCursorFollow();

        scrollTween = gsap.to(list, {
          x: function () {
            return -getScrollDistance();
          },
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: ENT_PIN_START,
            end: function () {
              return "+=" + getScrollDistance();
            },
            pin: section,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 0,
            invalidateOnRefresh: true,
            id: "ent-industries-pin",
            onEnter: function () {
              setPinActive(true);
            },
            onEnterBack: function () {
              setPinActive(true);
            },
            onLeave: function () {
              setPinActive(false);
              clearHover();
            },
            onLeaveBack: function () {
              setPinActive(false);
              clearHover();
            },
            onKill: function () {
              setPinActive(false);
              clearHover();
            },
          },
        });

        var onResize = debounce(function () {
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killDesktopScroll();
          killCursorFollow();
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        killDesktopScroll();
        killCursorFollow();
        return function () {};
      },
    );
  })();

  // --------------------------------------------------------------------------
  // How it works — pinned steps (after industries registration)
  // --------------------------------------------------------------------------

  (function initEntHowScroll() {
    var section = document.querySelector(".ent-how-section");
    if (!section) {
      return;
    }

    var items = gsap.utils.toArray(section.querySelectorAll(".ent-how_item"));
    if (!items.length) {
      return;
    }

    var mm = gsap.matchMedia();
    var scrollTriggers = [];

    function setActive(index) {
      var activeIndex = Math.max(0, Math.min(index, items.length - 1));

      items.forEach(function (item, i) {
        item.classList.toggle("is-active", i === activeIndex);
      });
    }

    function getActiveIndex(progress) {
      return Math.min(items.length - 1, Math.floor(progress * items.length));
    }

    function getScrollDistance() {
      return Math.round(window.innerHeight * 1.5);
    }

    function setPinActive(isActive) {
      section.classList.toggle("is-pin-active", isActive);
    }

    function killScrollTriggers() {
      scrollTriggers.forEach(function (st) {
        st.kill();
      });
      scrollTriggers = [];
      setPinActive(false);
    }

    function registerScrollTrigger(config) {
      scrollTriggers.push(ScrollTrigger.create(config));
    }

    function createDesktopScrollTrigger() {
      killScrollTriggers();
      setActive(0);

      registerScrollTrigger({
        id: "ent-how-pin",
        trigger: section,
        start: ENT_PIN_START,
        end: function () {
          return "+=" + getScrollDistance();
        },
        pin: section,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          setActive(getActiveIndex(self.progress));
        },
        onEnter: function () {
          setPinActive(true);
        },
        onEnterBack: function () {
          setPinActive(true);
        },
        onLeave: function () {
          setPinActive(false);
        },
        onLeaveBack: function () {
          setPinActive(false);
        },
        onKill: function () {
          setPinActive(false);
        },
      });
    }

    function createMobileScrollTriggers() {
      killScrollTriggers();

      function syncMobileActive() {
        var viewportCenter = window.innerHeight / 2;
        var closestIndex = 0;
        var closestDistance = Infinity;

        items.forEach(function (item, index) {
          var rect = item.getBoundingClientRect();
          var itemCenter = rect.top + rect.height / 2;
          var distance = Math.abs(itemCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActive(closestIndex);
      }

      registerScrollTrigger({
        id: "ent-how-mobile-sync",
        trigger: section.querySelector(".ent-how_wrap") || section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: syncMobileActive,
      });

      syncMobileActive();
    }

    mm.add("(prefers-reduced-motion: reduce)", function () {
      killScrollTriggers();
      setActive(0);
      return function () {};
    });

    mm.add(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
      function () {
        var onResize = debounce(function () {
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          ScrollTrigger.refresh();
          createDesktopScrollTrigger();
          ScrollTrigger.refresh();
          setActive(0);
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killScrollTriggers();
        };
      },
    );

    mm.add(
      "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      function () {
        var onResize = debounce(function () {
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener("resize", onResize);

        requestAnimationFrame(function () {
          createMobileScrollTriggers();
          ScrollTrigger.refresh();
        });

        return function () {
          window.removeEventListener("resize", onResize);
          killScrollTriggers();
          setActive(0);
        };
      },
    );
  })();
})();
