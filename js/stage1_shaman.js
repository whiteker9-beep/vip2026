GameEngine.registerStage(1, {
  badge: "STAGE 1 · K-SHAMANISM (한국 샤머니즘)",
  title: "Seal the Grim Reaper!",
  titleKo: "저승사자 황금 부적 봉인!",
  descEn: "A Grim Reaper (👻) in a black hat appears at a Korean shaman ritual! Stop him right on the golden talisman (📜) to seal him.",
  descKo: "무당의 굿판에 검은 갓을 쓴 저승사자(👻)가 나타났습니다! 중앙의 황금 부적(📜) 위에 겹쳤을 때 정확히 멈춰 봉인하세요.",
  ruleEn: "Tap anywhere on the screen when the Grim Reaper (👻) overlaps the golden talisman! (22s)",
  ruleKo: "좌우로 움직이는 저승사자(👻)가 중앙 황금 부적 위에 왔을 때 화면을 터치하세요! 연속 봉인 시 콤보 보너스!",
  hint: "Tap when the Grim Reaper hits the golden talisman! / 저승사자가 황금 부적에 왔을 때 터치!"
}, (engine) => {
  const area = document.getElementById('play-area');
  area.innerHTML = `
    <div class="top-banner">Tap when Grim Reaper overlaps the Talisman! / 저승사자가 부적에 겹칠 때 터치!</div>
    <div class="shaman-stage">
      <div id="talisman-card">
        <div class="spell">急急如律令</div>
        <div class="seal-tag">▲ 황금 부적 (TALISMAN) ▲</div>
      </div>
      <div id="reaper-rail">
        <div id="moving-reaper">
          <div class="reaper-hat"></div>
          <div class="reaper-face">👻</div>
          <div class="reaper-label">저승사자</div>
          <div id="stamp-fx" class="sealed-stamp hidden">封</div>
        </div>
      </div>
      <div id="hit-msg" style="position:absolute; bottom:18px; width:100%; text-align:center; font-size:1.2rem; font-weight:900;"></div>
    </div>
  `;

  const rail = document.getElementById('reaper-rail');
  const reaper = document.getElementById('moving-reaper');
  const talisman = document.getElementById('talisman-card');
  const stampFx = document.getElementById('stamp-fx');
  const msg = document.getElementById('hit-msg');

  let posX = 0, dir = 1, speed = 6, combo = 0, timeLeft = 22;
  engine.updateHud(timeLeft, combo);

  area.onpointerdown = () => {
    const maxW = rail.clientWidth - 76;
    const center = maxW / 2;
    const dist = Math.abs(posX - center);

    if (dist <= 38) {
      combo++;
      const gain = Math.round(110 * (1 + (combo - 1) * 0.25));
      engine.totalScore += gain;
      speed = Math.min(15.5, speed + 0.75);

      stampFx.classList.remove('hidden');
      talisman.style.transform = 'scale(1.15)';
      talisman.style.boxShadow = '0 0 45px #fef08a';
      setTimeout(() => {
        stampFx.classList.add('hidden');
        talisman.style.transform = 'scale(1)';
        talisman.style.boxShadow = '0 0 28px rgba(250, 204, 21, 0.55)';
      }, 220);

      msg.style.color = '#facc15';
      msg.innerText = dist <= 14 ? `⚡ PERFECT SEAL! +${gain}` : `📜 TALISMAN HIT! +${gain}`;
      engine.updateHud(timeLeft, combo, true);
    } else {
      combo = 0;
      speed = Math.max(6, speed - 1);
      engine.totalScore = Math.max(0, engine.totalScore - 30);
      msg.style.color = '#f87171';
      msg.innerText = 'MISSED! (-30)';
      engine.triggerShake();
      engine.updateHud(timeLeft, combo, false);
    }
  };

  engine.gameLoop = setInterval(() => {
    const maxW = rail.clientWidth - 76;
    posX += dir * speed;
    if (posX >= maxW) { posX = maxW; dir = -1; }
    if (posX <= 0) { posX = 0; dir = 1; }
    reaper.style.left = posX + 'px';
  }, 16);

  engine.timerInterval = setInterval(() => {
    timeLeft--;
    engine.updateHud(timeLeft, combo);
    engine.updateCountdown(timeLeft);
    if (timeLeft <= 0) engine.nextStageOrEnd();
  }, 1000);
});