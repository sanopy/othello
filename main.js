var N = 8;
var turn = true; // true: black, false: white
var dx = [1, -1, 0, 0, 1, 1, -1, -1];
var dy = [0, 0, 1, -1, 1, -1, 1, -1];

function init() {
  // 盤面表示
  var html = '', idx;
  for(var i = 0;i < N; i++){
    html += '<tr>';
    for(var j = 0;j < N; j++){
      idx = i * N + j;
      html += '<td class="cell" id="cell' + idx + '"></td>';
    }
    html += '</tr>';
  }
  $('table').html(html);

  // 初期配置
  idx = (N / 2 - 1) * N + (N / 2);
  $('#cell' + idx).html('<div class="black"></div>');
  $('#cell' + (idx + N - 1)).html('<div class="black"></div>');
  $('#cell' + (idx - 1)).html('<div class="white"></div>');
  $('#cell' + (idx + N)).html('<div class="white"></div>');

  turn = true;
  showPlaceable(turn);
}
init();

// 置ける場所を再帰的に探索
function isPlaceable(x, y, color, dir) {
  var idx = y * N + x;
  if(x < 0 || x >= N || y < 0 || y >= N) return false;
  if($('#cell' + idx).children().length === 0) return false;
  if($('#cell' + idx).children().hasClass(color? 'black' : 'white')) return true;

  return isPlaceable(x + dx[dir], y + dy[dir], color, dir);
}

// 置ける場所を表示
function showPlaceable(color) {
  for(var i = 0;i < N; i++){
    for(var j = 0;j < N; j++){
      for(var k = 0;k < 8; k++){
        var idx = i * N + j, idx2 = (i + dy[k]) * N + j + dx[k];
        if($('#cell' + idx).children().length === 0 && $('#cell' + idx2).children().hasClass(color? 'white' : 'black') && isPlaceable(j + dx[k], i + dy[k], color, k)){
          $('#cell' + idx).addClass('placeable');
          break;
        }
      }
    }
  }
}

// 反転処理
function reverse(x, y, color, dir) {
  var idx = y * N + x;
  if(x < 0 || x >= N || y < 0 || y >= N) return false;
  if($('#cell' + idx).children().length === 0) return false;
  if($('#cell' + idx).children().hasClass(color? 'black' : 'white')) return true;

  var ret = reverse(x + dx[dir], y + dy[dir], color, dir);
  if(ret){
    $('#cell' + idx).children().removeClass(color? 'white' : 'black');
    $('#cell' + idx).children().addClass(color? 'black' : 'white');
  }
  return ret;
}

function whichTurn() {
  var cnt = 0;
  do {
    turn = !turn;
    $('input').attr({
      value: turn? 'black' : 'white'
    });
    $('td.placeable').removeClass('placeable');
    showPlaceable(turn);
    cnt++;
  } while($('td.placeable').length === 0 && cnt < 3);

  if(cnt === 3) finish();
}

// 得点計算 & 終了処理
function finish() {
  var black = 0, white = 0;
  for(var i = 0;i < N; i++){
    for(var j = 0;j < N; j++){
      var idx = i * N + j;
      if($('#cell' + idx).children().hasClass('black')) black++;
      else if($('#cell' + idx).children().hasClass('white')) white++;
    }
  }
  alert('黒 : ' + black + ', 白 : ' + white);
  // init();
  location.reload();
}

function randomAI(color) {
  var arr = [];
  $('.placeable').each(function() {
    arr.push($(this).attr('id').substr(4));
  });

  if(!arr.length) return;

  var idx = Math.floor(Math.random() * arr.length);
  var pos = arr[idx];
  // console.log(arr, idx, pos);
  var y = Math.floor(pos / N), x = pos % N;
  $('#cell' + pos).html('<div class="' + (turn? 'black' : 'white') + '"></div>');
  for(var i = 0;i < 8; i++)
    reverse(x + dx[i], y + dy[i], color, i);
}

function minimax(COLOR) {
  var px, py;
  var board = [];
  for(var i = 0;i < N; i++) board[i] = [];

  for(i = 0;i < N; i++){
    for(var j = 0;j < N; j++){
      var idx = i * N + j;
      if($('#cell' + idx).children().hasClass('black'))
        board[i][j] = 'x';
      else if($('#cell' + idx).children().hasClass('white'))
        board[i][j] = 'o';
      else
        board[i][j] = ' ';
    }
  }

  function placeable(x, y, color, dir) {
    if(x < 0 || x >= N || y < 0 || y >= N) return false;
    if(board[y][x] === ' ') return false;
    if(board[y][x] === color) return true;

    return placeable(x + dx[dir], y + dy[dir], color, dir);
  }

  function rev(x, y, color, dir) {
    if(x < 0 || x >= N || y < 0 || y >= N) return false;
    if(board[y][x] === ' ') return false;
    if(board[y][x] === color) return true;

    var ret = rev(x + dx[dir], y + dy[dir], color, dir);
    if(ret)
      board[y][x] = color;

    return ret;
  }

  function count(color) {
    var cnt = 0;

    for(var i = 0;i < N; i++){
      for(var j = 0;j < N; j++){
        var c = (color === 'x'? 'o' : 'x');
        if(board[i][j] === color) {
          cnt++;
          if(i === 0 && j === 0 || i === 0 && j === N-1 || i === N-1 && j === 0 || i === N-1 && j === N-1) cnt += 20;
          // if(i === 1 && j === 1 || i === 1 && j === N-2 || i === N-2 && j === 1 || i === N-2 && j === N-2) cnt -= 20;
        } else if(board[i][j] === c) {
          // cnt--;
          // if(i === 0 && j === 0 || i === 0 && j === N-1 || i === N-1 && j === 0 || i === N-1 && j === N-1) cnt -= 20;
          // if(i === 1 && j === 1 || i === 1 && j === N-2 || i === N-2 && j === 1 || i === N-2 && j === N-2) cnt += 20;
        }
      }
    }

    return cnt;
  }

  function rec(color, depth) {
    if(depth > 4) return count(turn? 'x' : 'o');

    var arr = [];
    for(var i = 0;i < N; i++){
      for(var j = 0;j < N; j++){
        for(var k = 0;k < 8; k++){
          var target = (color === 'x'? 'o' : 'x');
          if(i + dy[k] < 0 || i + dy[k] >= N || j + dx[k] < 0 || j + dx[k] >= N) continue;
          if(board[i][j] === ' ' && board[i + dy[k]][j + dx[k]] === target && placeable(j + dx[k], i + dy[k], color, k))
            arr.push(i * N + j);
        }
      }
    }

    if(arr.length === 0) return rec(color === 'x'? 'o' : 'x', depth + 1);

    var ret = (depth % 2? -Infinity : Infinity);
    for(i = 0;i < arr.length; i++){
      var idx = arr[i];
      var x = idx % N, y = Math.floor(idx / N);
      var tmp = $.extend(true, [[]], board);
      for(var j = 0;j < 8; j++)
        rev(x + dx[j], y + dy[j], color, j);
      var res = rec(color === 'x'? 'o' : 'x', depth + 1);
      if(depth % 2){
        if(depth === 1 && res > ret){
          px = x; py = y;
        }
        ret = Math.max(ret, res);
      } else {
        ret = Math.min(ret, res);
      }
      board = tmp.concat();
    }
    return ret;
  }

  rec(COLOR, 1);
  var pos = py * N + px;
  $('#cell' + pos).html('<div class="' + (COLOR === 'x'? 'black' : 'white') + '"></div>');
  for(i = 0;i < 8; i++)
    reverse(px + dx[i], py + dy[i], COLOR === 'x'? true : false, i);
}

$('.cell').click(function() {
  if($(this).hasClass('placeable')){
    $(this).html('<div class="' + (turn? 'black' : 'white') + '"></div>');

    var id = $(this).attr('id');
    var idx = id.substr(4);
    var x = idx % N, y = Math.floor(idx / N);
    for(var i = 0;i < 8; i++)
      reverse(x + dx[i], y + dy[i], turn, i);

    whichTurn();

    var flag = false;
    while(!turn){
      if(flag) alert('パスします');
      if($('#minimax').is(':checked')) minimax(turn? 'x' : 'o');
      else randomAI(turn);
      whichTurn();
      flag = true;
    }
    // if(!turn){
    //   var loop = setInterval(function() {
    //     minimax(turn? 'x' : 'o');
    //     whichTurn();
    //
    //     if(turn) clearInterval(loop);
    //   }, 3000);
    // }
  }
});
