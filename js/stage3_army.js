GameEngine.registerStage(3, {
  badge: "STAGE 3 · K-MILITARY & PX (한국 군대 문화 & PX)",
  title: "Dark Prank & PX Cosmetics!",
  titleKo: "\"이게 니 군생활이야~\" & PX 달팽이크림 득템",
  descEn: "A senior covers your eyes saying 'Your army life is pitch black like this!' Rub the dark room to find the flashlight (🔦) and unlock the military PX store, then tap famous Snail Creams (🐌)!",
  descKo: "선임이 눈을 가리며 '이게 니 군생활이야~ 캄캄하지?' 장난을 칩니다! 어둠을 문질러 손전등(🔦)을 찾아 불을 켠 뒤, PX 벨트 위 달팽이크림(🐌)·화장품만 골라 담으세요!",
  ruleEn: "1) Rub dark screen to find 🔦. 2) Tap green Cosmetics (🐌🧴🎭), avoid red Army Gear (🥾🪖🧹)! (28s)",
  ruleKo: "1단계: 어두운 화면을 문질러 손전등(🔦) 찾기 → 2단계: 초록색 화장품(🐌🧴🎭)만 터치! (빨간색 군용품 🥾🪖🧹 주의)",
  hint: "Find 🔦 in the dark, then tap green Cosmetics (🐌🧴)! / 🔦 찾아 불 켜고 초록 화장품만 터치!"
}, (engine) => {
  const area = document.getElementById('play-area');
  let timeLeft = 28, combo = 0;
  engine.updateHud(timeLeft, combo);

  const startDarkSearch = () => {
    area.innerHTML = `
      <div class="top-banner" style="background:#7f1d1d; color:#fff;">
        🙈 Rub the dark to find the Flashlight (🔦)!<br/>
        <span style="font-size:0.75rem; font-weight:normal;">어둠을 손가락으로 문질러 손전등(🔦)을 찾아 불을 켜세요!</span>
      </div>
      <div id="dark-room">
        <div id="senior-hands-overlay">
          <div class="hands-emoji">🖐️ 🖐️</div>
          <div class="senior-quote">
            "Eyes closed! Look, this is your army life~"<br/>
            <span style="font-size:0.86rem; color:#fff;">"눈 감아봐, 이게 니 군생활이야~ 캄캄하지?"</span>
          </div>
        </div>
        <div id="flashlight-circle"></div>
        <div id="hidden-lantern">
          <span>🔦</span>
          <span style="font-size:0.65rem; font-weight:900; color:#facc15; background:#000; padding:1px 5px; border-radius:6px;">PX KEY</span>
        </div>
      </div>
    `;

    const overlay = document.getElementById('senior-hands-overlay');
    const room = document.getElementById('dark-room');
    const circle = document.getElementById('flashlight-circle');
    const lantern = document.getElementById('hidden-lantern');

    setTimeout(() => {
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 350);
      }
    }, 1500);

    const lx = 35 + Math.random() * (room.clientWidth - 110);
    const ly = 35 + Math.random() * (room.clientHeight - 110);
    lantern.style.left = lx + 'px';
    lantern.style.top = ly + 'px';

    let discovered = false;
    const searchMove = (clientX, clientY) => {
      if (discovered) return;
      const rect = room.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      circle.style.display = 'block';
      circle.style.left = x + 'px';
      circle.style.top = y + 'px';

      const dist = Math.hypot(x - (lx + 34), y - (ly + 34));
      lantern.style.opacity = dist < 85 ? Math.max(0.25, 1 - dist / 85) : 0;

      if (dist < 38) {
        discovered = true;
        lantern.style.opacity = 1;
        room.style.background = '#fef08a';
        engine.totalScore += 350;
        engine.updateHud(timeLeft, combo);
        setTimeout(() => { if (timeLeft > 0) startPxConveyor(); }, 450);
      }
    };

    room.onpointermove = (e) => searchMove(e.clientX, e.clientY);
    room.onpointerdown = (e) => searchMove(e.clientX, e.clientY);
  };

  const startPxConveyor = () => {
    area.innerHTML = `
      <div class="top-banner" style="background:#065f46; color:#6ee7b7;">
        💡 Lights On! Welcome to Military PX Store!<br/>
        <span style="font-size:0.75rem; font-weight:normal;">불이 켜졌습니다! 초록색 인기 화장품만 터치해서 담으세요!</span>
      </div>
      <div class="px-store-bg">
        <div class="px-signboard">
          <span>✅ TAP: Snail Cream (달팽이크림)</span>
          <span style="color:#fca5a5;">❌ AVOID: Army Gear</span>
        </div>
        <div class="conveyor-belt" id="belt"></div>
        <div style="text-align:center; color:#cbd5e1; font-size:0.82rem; padding:0 12px;">
          Tap green boxes (🐌🧴🎭) · Do NOT tap red army gear (🥾🪖🧹)!
        </div>
      </div>
    `;
    const belt = document.getElementById('belt');
    let beltItems = [], tick = 0;

    const cosmetics = [
      { icon: '🐌', name: 'Snail Cream', sub: '달팽이크림' },
      { icon: '🧴', name: 'Aqua Cream', sub: '수분크림' },
      { icon: '🎭', name: 'Sheet Mask', sub: '마스크팩' }
    ];
    const armyGear = [
      { icon: '🥾', name: 'Army Boots', sub: '군화 (함정)' },
      { icon: '🪖', name: 'Helmet', sub: '방탄모 (함정)' },
      { icon: '🧹', name: 'Broom', sub: '빗자루 (함정)' }
    ];

    engine.gameLoop = setInterval(() => {
      tick++;
      if (tick % 24 === 0) {
        const isCosmetic = Math.random() < 0.68;
        const pick = isCosmetic
          ? cosmetics[Math.floor(Math.random() * cosmetics.length)]
          : armyGear[Math.floor(Math.random() * armyGear.length)];

        const el = document.createElement('div');
        el.className = `belt-item ${isCosmetic ? 'belt-cosmetic' : 'belt-military'}`;
        el.innerHTML = `
          <div class="item-icon">${pick.icon}</div>
          <div class="item-name" style="color:${isCosmetic ? '#6ee7b7' : '#fca5a5'};">${pick.name}</div>
          <div class="item-sub" style="color:#e2e8f0;">${pick.sub}</div>
        `;
        el.style.left = belt.clientWidth + 'px';
        belt.appendChild(el);

        const obj = { el, x: belt.clientWidth, isCosmetic, collected: false };
        el.onpointerdown = () => {
          if (obj.collected) return;
          obj.collected = true;
          if (obj.isCosmetic) {
            combo++;
            const gain = 120 + Math.min(80, combo * 10);
            engine.totalScore += gain;
            el.innerHTML = `<div class="item-icon">💖</div><div class="item-name" style="color:#facc15;">+${gain}</div>`;
            engine.updateHud(timeLeft, combo, true);
          } else {
            combo = 0;
            engine.totalScore = Math.max(0, engine.totalScore - 130);
            el.innerHTML = `<div class="item-icon">❌</div><div class="item-name" style="color:#f87171;">-130</div>`;
            engine.triggerShake();
            engine.updateHud(timeLeft, combo, false);
          }
          setTimeout(() => el.remove(), 180);
        };
        beltItems.push(obj);
      }

      for (let i = beltItems.length - 1; i >= 0; i--) {
        const it = beltItems[i];
        if (it.collected) { beltItems.splice(i, 1); continue; }
        it.x -= 6.2;
        it.el.style.left = it.x + 'px';
        if (it.x < -90) { it.el.remove(); beltItems.splice(i, 1); }
      }
    }, 20);
  };

  startDarkSearch();
  engine.timerInterval = setInterval(() => {
    timeLeft--;
    engine.updateHud(timeLeft, combo);
    engine.updateCountdown(timeLeft);
    if (timeLeft <= 0) engine.nextStageOrEnd();
  }, 1000);
});