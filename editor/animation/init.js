//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["ore_coordinate"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

//            $content.find('.call').html('checkio(' + JSON.stringify(checkioInput) + ')');
            $content.find('.output').html(result_addon + '<br>&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Ore was in ' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            var eCanvas = new OreDesertCanvas();
            eCanvas.createCanvas($content.find(".explanation")[0], checkioInput, rightResult);
            eCanvas.animateCanvas(userResult, explanation);


            this_e.setAnimationHeight($content.height() + 60);

        });

        function OreDesertCanvas() {
            var zx = 0;
            var zy = 0;
            var cellSize = 30;
            var cellN = 10;
            var fullSize = zx * 2 + cellN * cellSize;

            var delay = 2000;

            var colorDark = "#294270";
            var colorGrey = "#B2B3B3";
            var colorOrange = "#FABA00";
            var colorDarkOrange = "#F0801A";
            var colorBlue = "#6BA3CF";

            var attrCell = {"stroke": colorGrey, "stroke-width": 2, "fill": colorOrange};
            var attrOreCell = {"stroke": colorGrey, "stroke-width": 2, "fill": colorDarkOrange};
            var attrDot = {"stroke": colorDarkOrange, "stroke-width": 2, "fill": colorDarkOrange};
            var attrProbe = {"stroke": colorDark, "font-size": cellSize * 0.6};
            var attrProbeCircle = {"stroke": colorDark, "stroke-width": 4};
            var attrOreCircle = {"stroke": colorDark, "stroke-width": 4, "fill": colorDark};
            var attrCircle = {"stroke": colorBlue, "stroke-width": cellSize, "opacity": 0.5};

            var paper;

//            function createRing(x, y, rInner, rOuter) {
//                var res = Raphael.format("M{0},{1}A{2},{2},0,1,1,{3},{1}", x, y - rOuter, rOuter, x - 0.1);
////                res += Raphael.format("M{0},{1}A{2},{2},0,1,1,{3},{1}", x, y - rOuter, rOuter, x - 0.1);
//                res += Raphael.format("L{0},{1}A{2},{2},0,1,1,{3},{1}", x, y - rInner, rInner, x - 0.1);
//                res += Raphael.format("L{0},{1}Z", x, y - rOuter);
//
//                return res;
//            }

            this.createCanvas = function(dom, recentProbes, ore) {
                paper = Raphael(dom, fullSize, fullSize, 0, 0);
                for (var row = 0; row < cellN; row++){
                    for (var col = 0; col < cellN; col++){
                        paper.rect(zx + col * cellSize,
                                zy + row * cellSize,
                                cellSize, cellSize).attr(ore && row == ore[0] && col == ore[1] ? attrOreCell : attrCell);
                        paper.circle(zx + col * cellSize + cellSize / 2,
                                zy + row * cellSize + cellSize / 2,
                                1
                        ).attr(attrDot);
                    }
                }
                for (var i = 0; i < recentProbes.length; i++){

                    var probe = recentProbes[i];
                    var probeRow = probe[0];
                    var probeCol = probe[1];
                    var r = probe[2];
                    paper.circle(
                            zx + probeCol * cellSize + cellSize / 2,
                            zy + probeRow * cellSize + cellSize / 2,
                            r * cellSize
                    ).attr(attrCircle);
                    paper.text(zx + probeCol * cellSize + cellSize / 2,
                            zy + probeRow * cellSize + cellSize / 2,
                            r
                    ).attr(attrProbe);
                    paper.circle(
                            zx + probeCol * cellSize + cellSize / 2,
                            zy + probeRow * cellSize + cellSize / 2,
                            cellSize / 2 - 2
                    ).attr(attrProbeCircle);
                }

            };

            this.animateCanvas = function(lastProbe, distance) {
                if (distance != -1){
                    var probeRow = lastProbe[0];
                    var probeCol = lastProbe[1];
                    var tempSet = paper.set();
                    if (distance !== 0){
                        tempSet.push(paper.text(zx + probeCol * cellSize + cellSize / 2,
                                zy + probeRow * cellSize + cellSize / 2,
                                distance
                        ).attr(attrProbe).attr("opacity", 0));
                        var c = paper.circle(
                                zx + probeCol * cellSize + cellSize / 2,
                                zy + probeRow * cellSize + cellSize / 2,
                                0
                        ).attr(attrCircle);
                        c.animate({"r": distance * cellSize}, distance * delay / 14);
                    }
                    tempSet.push((paper.circle(
                            zx + probeCol * cellSize + cellSize / 2,
                            zy + probeRow * cellSize + cellSize / 2,
                            cellSize / 2 - 2
                    ).attr(distance === 0 ? attrOreCircle : attrProbeCircle)).attr("opacity", 0));
                    tempSet.animate({"opacity": 1}, delay);
                }
            }


        }


    }
);
