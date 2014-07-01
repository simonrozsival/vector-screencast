# Animation format thoughts

## general ideas

- The format needs to be as lightweight as possible.
- It should be somehow similar or derived from SVG (browser compatibility).
- Seeking should be easy and fast.
- As many data as possible should be saved
    + it might be used later to do some postprocessing
- Every movement of cursor must be saved (the cursor position is shown all the time - unless it is not inside the recording area)

## idea __#1__ (2014-06-01)

The video is divided into chunks corresponding to what happend on the screen in the last _n_ seconds (1, 2, 5 ?). Seeking will then be restricted to these chunks (at least in the first version).

### xml file structure

        <animation>
            <meta>
                ...
            </meta>
            <data>
                <chunk start="..." end="...">
                    <cursor>
                        <m x="..." y="..." pressure="[0 .. 1]" time="..." />
                        ...
                        <color-change name="..." />
                        ...
                    </cursor>
                    <svg>
                        <path d="..." style="stroke: [color]" />
                    </svg>
                </chunk>
                ...
                <chunk />
            </data>
        </animation>

- __cursor__ - the positions of cursor
    - __color-change__ - change of current color
    - __m__ - cursor movement
        + __pressure__ - stylus pressure, number between 0 and 1, for mouse it would be 0 - up, 1 - down
- __svg__ - contains the path(s) that were drawn in this chunk => rendering of the cursor movement should result in the same output
    + it doesn't have to be the SVG &lt;path&gt;

The advantage of this approach should be fast seeking - there is no need to render the output step by step but only to render some of the _svg_'s.

### disadvantages
- data duplicity - cursor movement and the pre-rendered svg. But if the resulting xml should be quite small anyway.
- pre-rendering does not have to match the style of the renderer
    + paths vs. trapezoides


