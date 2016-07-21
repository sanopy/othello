/// <reference path="./typings/jquery/jquery.d.ts" />
/// <reference path="./typings/jqueryui/jqueryui.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// $ tsd install jquery --save
// $ tsd install jqueryui --save
var Othello = (function () {
    function Othello() {
        this.N = 8;
        this.turn = true; // true: black, false: white
        this.dx = [1, -1, 0, 0, 1, 1, -1, -1];
        this.dy = [0, 0, 1, -1, 1, -1, 1, -1];
        // 盤面表示
        var html = "", idx;
        for (var i = 0; i < this.N; i++) {
            html += "<tr>";
            for (var j = 0; j < this.N; j++) {
                idx = i * this.N + j;
                html += "<td class=\"cell\" id=\"cell" + idx + "\"></td>";
            }
            html += "</tr>";
        }
        $("#board").html(html);
        // 初期配置
        idx = (this.N / 2 - 1) * this.N + (this.N / 2);
        $("#cell" + idx).html("<div class=\"black\"></div>");
        $("#cell" + (idx + this.N - 1)).html("<div class=\"black\"></div>");
        $("#cell" + (idx - 1)).html("<div class=\"white\"></div>");
        $("#cell" + (idx + this.N)).html("<div class=\"white\"></div>");
        this.turn = true;
        this.showPlaceable(this.turn);
    }
    // 置ける場所を再帰的に探索
    Othello.prototype.isPlaceable = function (x, y, color, dir) {
        var idx = y * this.N + x;
        if (x < 0 || x >= this.N || y < 0 || y >= this.N)
            return false;
        if ($("#cell" + idx).children().length === 0)
            return false;
        if ($("#cell" + idx).children().hasClass(color ? "black" : "white"))
            return true;
        return this.isPlaceable(x + this.dx[dir], y + this.dy[dir], color, dir);
    };
    // 置ける場所を表示
    Othello.prototype.showPlaceable = function (color) {
        for (var i = 0; i < this.N; i++) {
            for (var j = 0; j < this.N; j++) {
                for (var k = 0; k < 8; k++) {
                    var idx = i * this.N + j, idx2 = (i + this.dy[k]) * this.N + j + this.dx[k];
                    if ($("#cell" + idx).children().length === 0
                        && $("#cell" + idx2).children().hasClass(color ? "white" : "black")
                        && this.isPlaceable(j + this.dx[k], i + this.dy[k], color, k)) {
                        $("#cell" + idx).addClass("placeable");
                        break;
                    }
                }
            }
        }
        return;
    };
    // 反転処理
    Othello.prototype.reverse = function (x, y, color, dir) {
        var idx = y * this.N + x;
        if (x < 0 || x >= this.N || y < 0 || y >= this.N)
            return false;
        if ($("#cell" + idx).children().length === 0)
            return false;
        if ($("#cell" + idx).children().hasClass(color ? "black" : "white"))
            return true;
        var ret = this.reverse(x + this.dx[dir], y + this.dy[dir], color, dir);
        if (ret) {
            // $("#cell" + idx).children().removeClass(color ? "white" : "black", 500);
            // $("#cell" + idx).children().addClass(color ? "black" : "white", 500);
            $("#cell" + idx).children().removeClass(color ? "white" : "black");
            $("#cell" + idx).children().addClass(color ? "black" : "white");
        }
        return ret;
    };
    Othello.prototype.whichTurn = function () {
        var cnt = 0;
        do {
            this.turn = !this.turn;
            $("input").attr({
                value: this.turn ? "black" : "white"
            });
            $("td.placeable").removeClass("placeable");
            this.showPlaceable(this.turn);
            cnt++;
        } while ($("td.placeable").length === 0 && cnt < 3);
        if (cnt === 3)
            this.finish();
    };
    // 得点計算 & 終了処理
    Othello.prototype.finish = function () {
        var black = 0, white = 0;
        for (var i = 0; i < this.N; i++) {
            for (var j = 0; j < this.N; j++) {
                var idx = i * this.N + j;
                if ($("#cell" + idx).children().hasClass("black"))
                    black++;
                else if ($("#cell" + idx).children().hasClass("white"))
                    white++;
            }
        }
        alert("黒 : " + black + ", 白 : " + white);
        location.reload();
    };
    return Othello;
}());
var RandomAI = (function (_super) {
    __extends(RandomAI, _super);
    function RandomAI() {
        _super.apply(this, arguments);
    }
    RandomAI.prototype.AI = function (color) {
        var arr = [];
        $(".placeable").each(function () {
            arr.push($(this).attr("id").substr(4));
        });
        if (!arr.length)
            return;
        var idx = Math.floor(Math.random() * arr.length);
        var pos = arr[idx];
        // console.log(arr, idx, pos);
        var y = Math.floor(pos / this.N), x = pos % this.N;
        $("#cell" + pos).html("<div class=\"" + (this.turn ? "black" : "white") + "\"></div>");
        for (var i = 0; i < 8; i++)
            this.reverse(x + this.dx[i], y + this.dy[i], color, i);
    };
    return RandomAI;
}(Othello));
var MiniMaxAI = (function (_super) {
    __extends(MiniMaxAI, _super);
    function MiniMaxAI() {
        _super.apply(this, arguments);
        this.board = [];
    }
    MiniMaxAI.prototype.AI = function (COLOR) {
        for (var i = 0; i < this.N; i++)
            this.board[i] = [];
        for (var i = 0; i < this.N; i++) {
            for (var j = 0; j < this.N; j++) {
                var idx = i * this.N + j;
                if ($("#cell" + idx).children().hasClass("black"))
                    this.board[i][j] = "x";
                else if ($("#cell" + idx).children().hasClass("white"))
                    this.board[i][j] = "o";
                else
                    this.board[i][j] = " ";
            }
        }
        this.rec(COLOR, []);
        var pos = this.py * this.N + this.px;
        $("#cell" + pos).html("<div class=\"" + (COLOR === "x" ? "black" : "white") + "\"></div>");
        for (var i = 0; i < 8; i++)
            this.reverse(this.px + this.dx[i], this.py + this.dy[i], COLOR === "x" ? true : false, i);
    };
    MiniMaxAI.prototype.placeable = function (x, y, color, dir) {
        if (x < 0 || x >= this.N || y < 0 || y >= this.N)
            return false;
        if (this.board[y][x] === " ")
            return false;
        if (this.board[y][x] === color)
            return true;
        return this.placeable(x + this.dx[dir], y + this.dy[dir], color, dir);
    };
    MiniMaxAI.prototype.rev = function (x, y, color, dir) {
        if (x < 0 || x >= this.N || y < 0 || y >= this.N)
            return false;
        if (this.board[y][x] === " ")
            return false;
        if (this.board[y][x] === color)
            return true;
        var ret = this.rev(x + this.dx[dir], y + this.dy[dir], color, dir);
        if (ret)
            this.board[y][x] = color;
        return ret;
    };
    MiniMaxAI.prototype.evaluate = function (color, put) {
        var evaluateTable = [
            [30, -12, 0, -1, -1, 0, -12, 30],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [30, -12, 0, -1, -1, 0, -12, 30]
        ];
        var value = 0;
        for (var i = 0; i < put.length; i++) {
            // console.log(put[i]);
            var x = put[i][0], y = put[i][1], col = put[i][2];
            if (x !== null && y !== null) {
                value += col === color ? evaluateTable[y][x] : -evaluateTable[y][x];
            }
        }
        return value;
    };
    MiniMaxAI.prototype.rec = function (color, put) {
        if (put.length > 2)
            return this.evaluate(this.turn ? "x" : "o", put);
        var arr = [];
        for (var i = 0; i < this.N; i++) {
            for (var j = 0; j < this.N; j++) {
                for (var k = 0; k < 8; k++) {
                    var target = (color === "x" ? "o" : "x");
                    if (i + this.dy[k] < 0 || i + this.dy[k] >= this.N || j + this.dx[k] < 0 || j + this.dx[k] >= this.N)
                        continue;
                    if (this.board[i][j] === " " && this.board[i + this.dy[k]][j + this.dx[k]] === target && this.placeable(j + this.dx[k], i + this.dy[k], color, k))
                        arr.push(i * this.N + j);
                }
            }
        }
        if (arr.length === 0) {
            put.push([null, null, color]);
            var ret_1 = this.rec(color === "x" ? "o" : "x", put);
            put.pop();
            return ret_1;
        }
        var ret = put.length % 2 ? Infinity : -Infinity;
        for (var i = 0; i < arr.length; i++) {
            var idx = arr[i];
            var x = idx % this.N, y = Math.floor(idx / this.N);
            var tmp = $.extend(true, [[]], this.board);
            for (var j = 0; j < 8; j++)
                this.rev(x + this.dx[j], y + this.dy[j], color, j);
            put.push([x, y, color]);
            var res = this.rec(color === "x" ? "o" : "x", put);
            // console.log(put, put.length);
            put.pop();
            // console.log(put, put.length);
            if (put.length % 2 === 0) {
                if (put.length === 0 && res > ret) {
                    this.px = x;
                    this.py = y;
                }
                ret = Math.max(ret, res);
            }
            else {
                ret = Math.min(ret, res);
            }
            this.board = tmp.concat();
        }
        return ret;
    };
    return MiniMaxAI;
}(Othello));
var game = new MiniMaxAI();
$(".cell").click(function () {
    if ($(this).hasClass("placeable")) {
        // $(this).html("<div class=\"" + (game.turn ? "black" : "white") + "\"></div>");
        $(this).html("<div></div>");
        // $(this).children().addClass(game.turn ? "black" : "white", 1000, "easeOutCubic");
        $(this).children().addClass(game.turn ? "black" : "white");
        var id = $(this).attr("id");
        var idx = +id.substr(4);
        var x = idx % game.N, y = Math.floor(idx / game.N);
        for (var i = 0; i < 8; i++)
            game.reverse(x + game.dx[i], y + game.dy[i], game.turn, i);
        game.whichTurn();
        var flag = false;
        while (!game.turn) {
            if (flag)
                alert("パスします");
            if ($("#minimax").is(":checked"))
                game.AI(game.turn ? "x" : "o");
            else
                game.AI(game.turn);
            game.whichTurn();
            flag = true;
        }
    }
});
