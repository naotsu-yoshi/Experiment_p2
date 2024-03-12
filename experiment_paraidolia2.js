// パレイドリア実験の課題2
const jsPsych = initJsPsych({
  on_finish: function () {
    // jsPsych.data.displayData();
    // jsPsych.data.get().localSave("csv", `${filename}`);
  },
});

// ユニークなファイル名の生成
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

// 本試行で使うデザインの配列
let factors = {
  eyesPosY:[
  23.25,
  27.25,
  31.25,
  35.25,
  39.25,
  43.25,
  47.25,
  51.25,
  55.25,
  59.25,
  63.25
  ],
};

// 本実験デザイン
let full_design = jsPsych.randomization.factorial(factors, 1);

// 本実験のトライアル数
let trialNum = full_design.length * 2
let trial_count = 1;

// フルスクリーンモードのブロック
let enter_fullscreen = {
  type: jsPsychFullscreen,
  message: `
    <div style="text-align: Left ;margin-left: auto; margin-right: auto; width: 70%;">
    <p><b>この実験はスマートフォンやタブレットでは実施できません。パソコンでのみ実施していただけます。</b></p>
    <p>最後まで完了することでポイント獲得用のコードが表示されます。途中でブラウザを閉じるなどすると、コードが表示されずポイントが獲得できないのでご注意ください。</p>
    <p>下の [Continue] ボタンを押すと、フルスクリーンで実験が始まります。ESCキーを押すとフルスクリーンが終了します。<br>
    ただし、実験中はESCキーを押さないで、フルスクリーンのままで行ってください。
    </p>
    <p><small style="color: #5e5e5e;">Safariやお使いのブラウザの設定によっては、フルスクリーンモードに変更されない場合はあります。その場合はお手数ですが手動で変更をお願い致します。</small></p>
    </div>
  `,
  fullscreen_mode: true,
  data: {
    block: "fullscreen",
  },
  on_finish: function (data) {
    jsPsych.data.addProperties({ID:`${subject_id}`});
  },
};

// 実験の教示ブロック
let intro_Task = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>課題についての説明</h2>
    <div style="text-align: Left; margin-left: auto; margin-right: auto; width: 80%;max-width: 1280px;">
      <p>実験に参加して頂きありがとうございます。</p>
      <p>これは、図形に対する印象を評価してもらう実験になります（全部で${trialNum}回、実施していただきます）。</p>
      <p>実験が始まると、顔に見えるように配置された図形が画面に表示されます。図形の横にはいくつかの質問が設けられています。<br/>皆さんは<span style='color: red; font-weight: bold'>画面に表示された顔のように見える図形に対して感じた印象を質問に沿って回答</span>してください。</p>
      <p>質問に対する回答はすべて、スライダーをドラッグして回答してください。</p>

      <p>なお、実験を途中で取りやめることも可能です。その場合はESCボタンを押してブラウザを閉じてください。ただし、実験完了後にポイント獲得のためのコードが表示されますので、<u>参加を見合わせた場合や、途中でやめた場合にはポイントは獲得できません。</u></p>

      <p>上記の課題の内容について理解したら［回答へ進む］ボタンを押して、実験に進んでください。</p>
    </div>
  `,
  choices: ["回答へ進む"],
  data: {
    stimulus: null,
    block: "intro_Task",
  },
};


// 顔パレイドリアの評価ブロック
let pareidoria_trial = {
  type: jsPsychP5,
  sketch: 
  (p) => {
    // これはおまじないとして入れておく。
    let trial = jsPsych.getCurrentTrial();

    // アスペクト比やサイズに関する変数は、必要に応じて初期化...
    let aspectRatio = "16 / 10";
    let maxWidth = 890;
    let maxHeight = 500;

    // 目の位置の条件を読み込む
    let eyesPosY = jsPsych.timelineVariable("eyesPosY", true) / 100;
    let button;

    p.setup = () => {
      let questionHead = p.createDiv(
        "<h4>左に表示された「顔」について、以下の質問に回答して下さい</h4>"
      );

      // メインコンテナの作成とスタイリング
      let mainContainer = p.createDiv('');
      mainContainer.attribute('style', `
        width: 100vw;
        height: auto;
        aspect-ratio: ${aspectRatio};
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        max-width: ${maxWidth}px;
        max-height: ${maxHeight}px;
      `);
      // mainContainer.style('background-color', 'lightgreen');
      
      // キャンバスコンテナの作成とスタイリング
      let canvasContainer = p.createDiv('');
      canvasContainer.attribute('style', `
        width: 50%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin: 15px
    `);
      canvasContainer.parent(mainContainer);
      // canvasContainer.style('background-color', 'lightblue')

      // p5キャンバスの作成
      let canvasWidth = 250; // キャンバスの幅
      let canvasHeight = 250; // キャンバスの高さ
      p.createCanvas(canvasWidth, canvasHeight)
        .parent(canvasContainer);
      p.background(0); // 背景色を黒に設定

      // 基本の位置設定
      let centerX = canvasWidth / 2; // 中心のX座標
      let centerY = canvasHeight / 2; // 中心のY座標
      let diameter = 218.75; // 円の直径
      let radius = diameter / 2; // 半径

      // 顔の輪郭
      p.stroke(255); // 輪郭の色を白に設定
      p.strokeWeight(5); // 線の太さを5ピクセルに設定
      p.fill(0); // 塗りつぶしは黒に設定
      p.ellipse(centerX, centerY, diameter, diameter); // 中心座標を使用して円を描画

      // パーツのサイズの設定
      let parts_Size = diameter * 0.055;

      // 目の高さを設定する
      let eyesHeight = centerY - radius + diameter * eyesPosY;

      // X軸に沿って右目と左目に20.62%の距離で2つの円を追加
      let offset = diameter * 0.2062;

      // 左右の目を描画
      p.fill(255); // 塗りつぶしは白に設定
      p.ellipse(centerX + offset, eyesHeight, parts_Size, parts_Size); // 右側
      p.ellipse(centerX - offset, eyesHeight, parts_Size, parts_Size); // 左側

      // 口(真一文字)
      p.noFill(); // 内部の塗りつぶしを無効化
      p.stroke(255); // 線の色を白に設定
      let mouthPosY = centerY - radius + diameter * 0.8207; // 上端から下へ82.07%の位置
      p.line(centerX + (offset/2), mouthPosY, centerX - (offset/2), mouthPosY);

      // レスポンス要素
      // コントロール（スライダーとラベル）コンテナの作成とスタイリング
      let controlsContainer = p.createDiv('');
      controlsContainer.attribute('style', `
        width: 50%;
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 15px;
        max-width: 320px;
      `);
      controlsContainer.parent(mainContainer);

      // 年齢スライダーの設定
      let minSlider = 0;
      let maxSlider = 80;
      let defaultValue = 40;

      // 年齢を尋ねるVAS要素を生成する
      let textAgeContainer = p.createDiv(
        "<strong>何歳</strong>に見えますか？"
      );
      textAgeContainer.attribute('style', `
      text-align: center;
      margin-top: 10px;
      margin-bottom: 10px;
      `);
      textAgeContainer.parent(controlsContainer);
      
      // @KT 回答をリアルタイムで表示
      let ansAge = p.createDiv()
        .style("color", "rgb(50,115,246");
      ansAge.parent(textAgeContainer);

      // スライダー生成
      let sliderAge = p
        .createSlider(minSlider, maxSlider, defaultValue, 1)
        .size(200);
      sliderAge.parent(controlsContainer);

      // @KT 回答をリアルタイムで表示
      ansAge.html(sliderAge.value() + "歳");
      sliderAge.input(() => {
        ansAge.html(sliderAge.value() + "歳");
        button.removeAttribute("disabled");
      });

      // スライダーの下にテキストを配置するための別のコンテナ
      let textLabelAgeContainer = p.createDiv();
      textLabelAgeContainer.attribute('style', `
        width: calc(100% - 50px);
        display: flex;
        justify-content: space-between;
        margin-top: 1px;
      `);
      textLabelAgeContainer.parent(controlsContainer);

      let textAgeLeft = p.createDiv(`0歳`).parent(textLabelAgeContainer); // 左側のテキスト
      let textAgeRight = p.createDiv(`${maxSlider}歳`).parent(textLabelAgeContainer); // 右側のテキスト

      // 女性らしさスライダーの設定
      let minSliderFem = 0;
      let maxSliderFem = 100;
      let defaultValueFem = 50;

      // 女性らしさを尋ねるVAS要素を生成する
      let textFemContainer = p.createDiv(
        "どれくらい<strong>女性</strong>らしく見えますか？"
      );
      textFemContainer.attribute('style', `
        text-align: center;
        margin-top: 50px;
        margin-bottom: 10px;
      `);
      textFemContainer.parent(controlsContainer);

      // @KT 回答をリアルタイムで表示
      let ansFem = p.createDiv()
        .style("color", "rgb(50,115,246");
      ansFem.parent(textFemContainer);

      // スライダー生成
      let sliderFem = p
        .createSlider(minSliderFem, maxSliderFem, defaultValueFem, 1)
        .size(200);
      sliderFem.parent(textFemContainer);
      
      // @KT 回答をリアルタイムで表示
      ansFem.html(
        "男性 " + (100 - sliderFem.value()) + "% 女性 " + sliderFem.value() + "%"
      );
      sliderFem.input(() => {
        ansFem.html(
          "男性 " +
            (100 - sliderFem.value()) +
            "% 女性 " +
            sliderFem.value() +
            "%"
        );
        button.removeAttribute("disabled");
      });

      // スライダーの下にテキストを配置するための別のコンテナ
      let textLabelFemContainer = p.createDiv();
      textLabelFemContainer.attribute('style', `
        width: calc(100% - 50px);
        display: flex;
        justify-content: space-between;
      `);
      textLabelFemContainer.parent(controlsContainer);

      let textFemLeft = p.createDiv("男性的").parent(textLabelFemContainer); // 左側のテキスト
      let textFemRight = p.createDiv("女性的").parent(textLabelFemContainer); // 右側のテキスト

      // ボタンの作成
      button = p.createButton("決定")
      .style('font-size', `clamp(12px, 2vw, 24px)`)
      button.attribute("disabled", "disabled");

      // 残りトライアル数を表示
      Trial_remaining = p.createDiv(`${trial_count}/${trialNum}`);
      Trial_remaining.style("margin-top", "20px");

      // 時間を計測
      let startTime = p.millis();

      // ボタンが押されたときの処理
      button.mousePressed(() => {
        trial_count++;
        trial.data.eyePos = jsPsych.timelineVariable("eyesPosY", true);
        trial.data.Age = sliderAge.value();
        trial.data.Feminisity = sliderFem.value();
        trial.data.elapsedTime = p.millis() - startTime;
        p.clear();

        // トライアルを終了させる
        trial.end_trial();
      });
    };//p.setupの終わり
  },
  data: {
    response: null,
  },
};

// 実験ブロック1生成
let trial_block1 = {
  timeline_variables: full_design,
  timeline: [pareidoria_trial],
  repetitions: 1,
  randomize_order: true,
  data: {
    block: "test",
  },
  post_trial_gap: 500,
};

// 実験ブロック2生成
let trial_block2 = {
  timeline_variables: full_design,
  timeline: [pareidoria_trial],
  repetitions: 1,
  randomize_order: true,
  data: {
    block: "re-test",
  },
  post_trial_gap: 500,
};

// 人口統計データのブロック
let demographicInfo = {
  type: jsPsychSurveyHtmlForm,
  html: `
    <h3>人口統計データについての質問</h3>
    <p>ご自身の年齢を回答してください。</p>
    <p><input type="number" id="age" name="age" min="16" max="99"> 歳</p>

    <p>ご自身の自認する性別を回答してください。</p>
    <input type="radio" id="male" name="gender" value="男性" required>
    <label for="male">男性</label>
    <input type="radio" id="female" name="gender" value="女性" required>
    <label for="female">女性</label>
    <input type="radio" id="other" name="gender" value="回答しない" required>
    <label for="other">回答しない</label><br>
    <br>
  `,
  button_label: "進む",
  data: {
    block: "demographicInfo",
  },
  on_finish: function (data) {
    jsPsych.data.get().addToLast(data.response);
  },
};

// データをOSFに送るブロック(これより前までのデータだけが保存される)
let save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "lA0VMHVMSpnu",
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv(),
  on_load: function(trial){
    // spinner要素を選択
    const spinner = document.querySelector('.spinner');

    // 新しい<p>要素を作成
    const messageElement = document.createElement('p');
    messageElement.textContent = '処理中です。しばらくお待ちください。利用環境によっては時間がかかる場合がありますので、終了するまでお待ち下さい。';

    // spinnerの下端の位置を取得
    const spinnerRect = spinner.getBoundingClientRect();
    const spinnerBottom = spinnerRect.bottom;

    // ビューポートの高さからspinnerの下端の位置を引いて、適切なmarginBottomを計算して適用
    const marginBottom = window.innerHeight - spinnerBottom - 20; // 20pxは少し余裕を持たせるため
    messageElement.style.marginBottom = `${marginBottom}px`;

    // spinnerの後に<p>要素を挿入
    spinner.parentNode.insertBefore(messageElement, spinner.nextSibling);
  }
};

// デブリーフィング
let end_debriefing = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function () {
    return `
      <div style="text-align: left; margin: 10px 100px;>
        <p style = "text-align: left">全ての試行が終わりました。これで実験は終了となります。</p>
        <p style = "text-align: left">今回の作業完了コードは下記のボタンを押すと表示されます。</p>
        <p style = "text-align: left">表示される4桁の数字を、Yahoo!クラウドソーシングの設問への回答として<u>半角で</u>入力して下さい。</p>
        <p style = "text-align: left">この数字の入力は<span style="color: red;">1度しかできない</span>ため、間違えないように十分に注意してください。</p>
        <p style = "text-align: left">［完了コードを見る］ボタンを押すと報酬ポイント獲得用のコードが表示されます。表示された完了コードをメモしたらタブを閉じてください。ご協力ありがとうございました。</p>
      </div>
    `;
  },
  choices: ["完了コードを見る"],
  data: {
    stimulus: null,
  },
  on_finish: function (data) {
    jsPsych.endExperiment("1104");
  },
};

jsPsych.run([
  enter_fullscreen,
  intro_Task,
  trial_block1,
  trial_block2,
  demographicInfo,
  save_data,
  end_debriefing,
]);
