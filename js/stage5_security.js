GameEngine.registerStage(5, {
  badge: "STAGE 5 · K-SECURITY (한국의 치안과 보안)",
  title: "Spot the Thief: Lock ONLY the Bike!",
  titleKo: "도둑을 찾아라! 자전거 옆 도둑만 잠금!",
  descEn: "Scan all 6 spots carefully! Tap ONLY when you see a Thief (🥷) standing next to a Bicycle (🚲) to lock it (🔒). Even if a Thief (🥷) walks right past an unattended Cafe Laptop (💻), do NOT tap it—laptops are 100% safe in Korea!",
  descKo: "6개 구역을 잘 살펴보세요! 자전거(🚲) 바로 옆에 도둑(🥷)이 나타났을 때만 터치해 자물쇠(🔒)를 채우세요. 카페 노트북(💻) 옆에 도둑(🥷)이 지나가도 한국에선 절대 훔쳐가지 않으니 누르지 마세요!",
  ruleEn: "Tap ONLY Bicycle + Thief (🚲🥷). Never tap Laptops (💻) or bikes without a thief! (30s)",
  ruleKo: "자전거와 도둑이 함께 있는 카드(🚲🥷)만 터치하세요! 노트북(💻)이나 도둑 없는 자전거를 누르면 감점됩니다!",
  hint: "Tap ONLY 🚲🥷! Never tap 💻 or 🚲 alone! / 도둑이 붙은 자전거(🚲🥷)만 터치! 노트북은 터치 금지!"
}, (engine) => {
  engine.clearLoops();

  const area = document.getElementById('play-area');
  area.innerHTML = `
    <div class="top-banner" style="background:#1e3a8a; color:#93c5fd;">
      👀 Spot & Tap ONLY [🚲 + 🥷]! · Never tap [💻]!
      <br/><span style="font-size:0.75rem; font-weight:normal;">자전거 옆에 도둑(🚲🥷)이 있을 때만 터치! 노트북(💻)은 터치 금지!</span>
    </div>
    <div style="padding:14px; height:calc(100% - 46px); background:#0f172a; display:flex; flex-direction:column; justify-content:space-between;">
      <div class="spots-row" id="mix-row-1" style="height:132px;"></div>
      <div class="spots-row" id="mix-row-2" style="height:132px;"></div>
    </div>
  `;

  const row1 = document.getElementById('mix-row-1');
  const row2 = document.getElementById('mix-row-2');
  let timeLeft = 30, combo = 0;
  engine.updateHud(timeLeft, combo);

  const slots = [];
  let roundActive = false;
  let roundExpireAt = 0;
  let nextRoundAt = Date.now() + 200;

  // 모든 카드가 동일한 기본 테두리(색상 힌트 제거)와 큼직한 도둑 아이콘을 갖도록 렌더링
  const startNewShuffledRound = () => {
    const targetBikeCount = (timeLeft <= 15 && Math.random() < 0.45) ? 2 : 1;
    const roles = [];

    for (let i = 0; i < targetBikeCount; i++) roles.push('THIEF_BIKE');
    roles.push('THIEF_LAPTOP'); // 도둑이 옆에 있지만 누르면 안 되는 노트북 함정
    roles.push('SAFE_BIKE');    // 도둑 없는 자전거
    while (roles.length < 6) {
      roles.push(Math.random() < 0.55 ? 'SAFE_LAPTOP' : 'SAFE_BIKE');
    }

    // 무작위 위치 셔플
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // 클릭하기 전에 바뀌지 않도록 충분히 여유 있는 시간 제공 (2.2초 -> 후반 1.85초)
    const duration = timeLeft > 15 ? 2200 : 1850;
    roundActive = true;
    roundExpireAt = Date.now() + duration;

    slots.forEach((s, idx) => {
      s.role = roles[idx];
      s.handled = false;
      s.el.classList.remove('thief-alert');
      s.el.style.background = '#1e293b';
      s.el.style.borderColor = '#334155'; // 모든 카드 테두리 통일 (힌트 제거)

      if (s.role === 'THIEF_BIKE') {
        s.el.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; font-size:2.15rem; line-height:1;">
            <span>🚲</span><span style="filter:drop-shadow(0 0 6px rgba(239,68,68,0.9));">🥷</span>
          </div>
          <div class="spot-status" style="color:#cbd5e1; margin-top:6px;">Street Bike</div>
        `;
      } else if (s.role === 'THIEF_LAPTOP') {
        s.el.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; font-size:2.15rem; line-height:1;">
            <span>💻</span><span style="filter:drop-shadow(0 0 6px rgba(239,68,68,0.9));">🥷</span>
          </div>
          <div class="spot-status" style="color:#cbd5e1; margin-top:6px;">Cafe Laptop</div>
        `;
      } else if (s.role === 'SAFE_LAPTOP') {
        s.el.innerHTML = `
          <div style="font-size:2.15rem; line-height:1;">💻</div>
          <div class="spot-status" style="color:#94a3b8; margin-top:6px;">Cafe Laptop</div>
        `;
      } else {
        s.el.innerHTML = `
          <div style="font-size:2.15rem; line-height:1;">🚲</div>
          <div class="spot-status" style="color:#94a3b8; margin-top:6px;">Street Bike</div>
        `;
      }
    });
  };

  for (let i = 0; i < 6; i++) {
    const card = document.createElement('div');
    card.className = 'spot-card';
    const slot = { el: card, role: 'IDLE', handled: false };

    card.onpointerdown = () => {
      if (!roundActive || slot.handled) return;

      if (slot.role === 'THIEF_BIKE') {
        // 정답: 도둑 붙은 자전거 잠금 성공!
        slot.handled = true;
        combo++;
        const gain = 160 + Math.min(100, combo * 15);
        engine.totalScore += gain;
        engine.updateHud(timeLeft, combo, true);

        card.style.background = 'rgba(22, 163, 74, 0.25)';
        card.style.borderColor = '#4ade80';
        card.innerHTML = `
          <div class="spot-icon">🔒</div>
          <div class="spot-status" style="color:#4ade80;">LOCKED! +${gain}</div>
        `;

        // 이번 배치의 도둑 자전거를 모두 잠갔다면 0.35초 뒤 다음 배치로 전환
        const remainingThieves = slots.filter(s => s.role === 'THIEF_BIKE' && !s.handled).length;
        if (remainingThieves === 0) {
          roundActive = false;
          nextRoundAt = Date.now() + 380;
        }
      } else if (slot.role === 'THIEF_LAPTOP' || slot.role === 'SAFE_LAPTOP') {
        // 함정: 카페 노트북 터치 시 감점
        slot.handled = true;
        combo = 0;
        engine.totalScore = Math.max(0, engine.totalScore - 150);
        engine.updateHud(timeLeft, combo, false);
        engine.triggerShake();

        card.style.background = 'rgba(220, 38, 38, 0.25)';
        card.style.borderColor = '#f87171';
        card.innerHTML = `
          <div class="spot-icon">🚫</div>
          <div class="spot-status" style="color:#f87171;">Laptop Safe! -150</div>
        `;
      } else if (slot.role === 'SAFE_BIKE') {
        // 도둑도 없는 평범한 자전거 터치 시 감점
        slot.handled = true;
        combo = 0;
        engine.totalScore = Math.max(0, engine.totalScore - 60);
        engine.updateHud(timeLeft, combo, false);
        engine.triggerShake();

        card.style.background = 'rgba(220, 38, 38, 0.18)';
        card.style.borderColor = '#f87171';
        card.innerHTML = `
          <div class="spot-icon">⚠️</div>
          <div class="spot-status" style="color:#f87171;">No Thief! -60</div>
        `;
      }
    };

    if (i < 3) row1.appendChild(card);
    else row2.appendChild(card);
    slots.push(slot);
  }

  engine.gameLoop = setInterval(() => {
    const now = Date.now();

    if (roundActive && now > roundExpireAt) {
      const missedThieves = slots.filter(s => s.role === 'THIEF_BIKE' && !s.handled);
      roundActive = false;

      if (missedThieves.length > 0) {
        combo = 0;
        engine.totalScore = Math.max(0, engine.totalScore - (110 * missedThieves.length));
        engine.updateHud(timeLeft, combo, false);
        engine.triggerShake();

        missedThieves.forEach(m => {
          m.el.style.background = 'rgba(220, 38, 38, 0.22)';
          m.el.style.borderColor = '#f87171';
          m.el.innerHTML = `
            <div class="spot-icon">💨</div>
            <div class="spot-status" style="color:#f87171;">STOLEN! -110</div>
          `;
        });
        nextRoundAt = now + 450;
      } else {
        nextRoundAt = now + 150;
      }
    } else if (!roundActive && now >= nextRoundAt) {
      startNewShuffledRound();
    }
  }, 100);

  engine.timerInterval = setInterval(() => {
    timeLeft--;
    engine.updateHud(timeLeft, combo);
    engine.updateCountdown(timeLeft);
    if (timeLeft <= 0) engine.nextStageOrEnd();
  }, 1000);
});