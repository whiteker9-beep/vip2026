GameEngine.registerStage(2, {
  badge: "STAGE 2 · K-MEDICINE (한방 쌍화탕 & 역동 침술)",
  title: "Gather 5 of Each Herb & Acupuncture!",
  titleKo: "쌍화탕 3대 약재(각 5개) 달이기 & 경혈 침술",
  descEn: "To brew authentic 'Ssanghwa-tang', collect 5 of EACH herb—5 Ginseng (🫚), 5 Licorice (🌿), and 5 Jujube (🍒)—while avoiding Bombs (💣)! Once brewed, treat the patient by tapping sequential acupoints (1→2→3...) and dodging the moving Forbidden Zone (🚫)!",
  descKo: "정통 쌍화탕 레시피 도전! 인삼(🫚) 5개, 감초(🌿) 5개, 대추(🍒) 5개를 재료별로 모두 모아야 쌍화탕이 완성됩니다(폭탄 💣 주의)! 완성 후에는 떠다니는 금침(🚫)을 피해 혈자리(1→2→3...)에 침을 놓으세요!",
  ruleEn: "1) Collect 5 of EACH herb: 🫚x5, 🌿x5, 🍒x5 (avoid 💣). 2) Tap 1→2→3... acupoints & dodge moving 🚫! (55s)",
  ruleKo: "1단계: 인삼(🫚)·감초(🌿)·대추(🍒) 각각 5개씩 모으기 → 2단계: 움직이는 금침(🚫)을 피해 1→2→3... 순서대로 침 놓기!",
  hint: "Collect 5 of EACH herb (🫚5 · 🌿5 · 🍒5), then dodge 🚫 & tap 1→2→3...! / 재료별 5개씩 모은 뒤 금침 피해 침 놓기!"
}, (engine) => {
  engine.clearLoops();

  const area = document.getElementById('play-area');
  let timeLeft = 55, combo = 0;

  // 재료별 목표 개수 (각 5개씩)
  const targetPerHerb = 5;
  const herbCounts = { '🫚': 0, '🌿': 0, '🍒': 0 };
  engine.updateHud(timeLeft, combo);

  const showFloatingText = (parent, x, y, text, color) => {
    const fx = document.createElement('div');
    fx.className = 'float-score';
    fx.style.left = x + 'px';
    fx.style.top = y + 'px';
    fx.style.color = color;
    fx.innerText = text;
    parent.appendChild(fx);
    setTimeout(() => fx.remove(), 600);
  };

  // ==========================================
  // Phase 1: 재료별(🫚, 🌿, 🍒) 각각 5개씩 모아 쌍화탕 완성하기
  // ==========================================
  const startBrewPhase = () => {
    area.innerHTML = `
      <div class="top-banner" id="herb-banner" style="padding:6px 10px;">
        <div style="font-size:0.8rem; margin-bottom:4px;">🍵 Collect 5 of EACH Herb for Ssanghwa-tang! (Avoid 💣)</div>
        <!-- 3대 약재별 5개 수집 현황 보드 -->
        <div style="display:flex; justify-content:center; gap:8px;">
          <div id="pill-🫚" style="background:#0f172a; border:1.5px solid #475569; border-radius:8px; padding:2px 8px; font-size:0.82rem; color:#fde68a; transition:all 0.2s;">
            🫚 <span id="cnt-🫚">0</span>/5
          </div>
          <div id="pill-🌿" style="background:#0f172a; border:1.5px solid #475569; border-radius:8px; padding:2px 8px; font-size:0.82rem; color:#86efac; transition:all 0.2s;">
            🌿 <span id="cnt-🌿">0</span>/5
          </div>
          <div id="pill-🍒" style="background:#0f172a; border:1.5px solid #475569; border-radius:8px; padding:2px 8px; font-size:0.82rem; color:#fca5a5; transition:all 0.2s;">
            🍒 <span id="cnt-🍒">0</span>/5
          </div>
        </div>
      </div>
      <div class="herbal-stage" id="herbal-stage" style="height:calc(100% - 62px);">
        <div class="wood-table"></div>
        <div id="medicine-pot"><span class="pot-tag">쌍화탕</span></div>
      </div>
    `;
    const stageEl = document.getElementById('herbal-stage');
    const banner = document.getElementById('herb-banner');
    const pot = document.getElementById('medicine-pot');
    const potWidth = 68;
    let potX = (stageEl.clientWidth - potWidth) / 2;
    pot.style.left = potX + 'px';
    let stunnedUntil = 0;

    const movePot = (clientX) => {
      if (Date.now() < stunnedUntil) return;
      const rect = stageEl.getBoundingClientRect();
      potX = Math.max(0, Math.min(rect.width - potWidth - 16, clientX - rect.left - potWidth / 2));
      pot.style.left = potX + 'px';
    };
    stageEl.onpointermove = (e) => movePot(e.clientX);
    stageEl.onpointerdown = (e) => movePot(e.clientX);

    const allHerbs = ['🫚', '🌿', '🍒'];
    let items = [], tick = 0;

    engine.gameLoop = setInterval(() => {
      tick++;
      pot.style.opacity = Date.now() < stunnedUntil ? '0.4' : '1';
      if (tick % 11 === 0) {
        const isBomb = Math.random() < 0.25;
        let chosenHerb = allHerbs[Math.floor(Math.random() * allHerbs.length)];

        // 아직 5개를 못 채운 부족한 재료가 더 자주 나오도록 스마트 확률 보정
        const neededHerbs = allHerbs.filter(h => herbCounts[h] < targetPerHerb);
        if (neededHerbs.length > 0 && Math.random() < 0.72) {
          chosenHerb = neededHerbs[Math.floor(Math.random() * neededHerbs.length)];
        }

        const el = document.createElement('div');
        el.className = `falling-item ${isBomb ? 'item-bomb' : 'item-good'}`;
        el.innerText = isBomb ? '💣' : chosenHerb;
        const x = Math.random() * (stageEl.clientWidth - 46);
        el.style.left = x + 'px';
        el.style.top = '-20px';
        stageEl.appendChild(el);
        items.push({ el, x, y: -20, isBomb, herbType: chosenHerb, speed: 6.0 + Math.random() * 2.2 });
      }

      const catchTop = stageEl.clientHeight - 72;
      const catchBottom = stageEl.clientHeight - 20;

      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;
        it.el.style.top = it.y + 'px';

        if (it.y >= catchTop && it.y <= catchBottom && Math.abs((it.x + 23) - (potX + potWidth / 2)) < 40) {
          if (it.isBomb) {
            combo = 0;
            engine.totalScore = Math.max(0, engine.totalScore - 140);
            stunnedUntil = Date.now() + 650;
            showFloatingText(stageEl, potX + 8, catchTop - 10, '💥 -140', '#f87171');
            engine.triggerShake();
            engine.updateHud(timeLeft, combo, false);
          } else {
            combo++;
            const hType = it.herbType;
            const wasIncomplete = herbCounts[hType] < targetPerHerb;
            herbCounts[hType] = Math.min(targetPerHerb, herbCounts[hType] + 1);

            const gain = (wasIncomplete ? 85 : 40) + (combo * 8);
            engine.totalScore += gain;
            pot.style.transform = 'scale(1.14, 0.88)';
            setTimeout(() => { if (pot) pot.style.transform = 'scale(1, 1)'; }, 110);

            // 상단 재료 카운터 UI 업데이트
            const cntEl = document.getElementById(`cnt-${hType}`);
            const pillEl = document.getElementById(`pill-${hType}`);
            if (cntEl) cntEl.innerText = herbCounts[hType];

            if (wasIncomplete && herbCounts[hType] === targetPerHerb) {
              // 해당 재료 5개 달성 완료 표시!
              if (pillEl) {
                pillEl.style.background = '#065f46';
                pillEl.style.borderColor = '#4ade80';
                pillEl.style.transform = 'scale(1.15)';
                setTimeout(() => { if (pillEl) pillEl.style.transform = 'scale(1)'; }, 220);
              }
              showFloatingText(stageEl, potX - 8, catchTop - 16, `${hType} 5/5 완료! +${gain}`, '#4ade80');
            } else if (!wasIncomplete) {
              showFloatingText(stageEl, potX + 4, catchTop - 10, `보너스 +${gain}`, '#94a3b8');
            } else {
              showFloatingText(stageEl, potX + 10, catchTop - 10, `${hType} +${gain}`, '#facc15');
            }

            engine.updateHud(timeLeft, combo, true);

            // 3가지 재료 모두 5개씩 채웠는지 확인
            const allCompleted = allHerbs.every(h => herbCounts[h] >= targetPerHerb);
            if (allCompleted) {
              clearInterval(engine.gameLoop);
              engine.totalScore += 350;
              engine.updateHud(timeLeft, combo, false);
              banner.style.background = '#065f46';
              banner.style.color = '#6ee7b7';
              banner.innerHTML = `🍵 Ssanghwa-tang Brewed! (+350) Next: Acupuncture!<br/><span style="font-size:0.74rem;">모든 약재 5개씩 수집 완료! 이제 환자의 몸에 침을 놓아주세요!</span>`;
              setTimeout(() => { if (timeLeft > 0) startAcupuncturePhase(); }, 950);
              return;
            }
          }
          it.el.remove();
          items.splice(i, 1);
        } else if (it.y > stageEl.clientHeight) {
          it.el.remove();
          items.splice(i, 1);
        }
      }
    }, 22);
  };

  // ==========================================
  // Phase 2: 순차 출현(3~5혈 가변) + 움직이는 금침(🚫) 회피 침술
  // ==========================================
  const startAcupuncturePhase = () => {
    clearInterval(engine.gameLoop);
    area.innerHTML = `
      <div class="top-banner" style="background:#7f1d1d; color:#fecaca;" id="acu-banner">
        📍 Acupuncture! Tap points in order · Dodge moving 🚫!<br/>
        <span style="font-size:0.75rem; font-weight:normal;">차례로 뜨는 혈자리(1→2→3...)에 침 놓기! 떠다니는 금침(🚫) 주의!</span>
      </div>
      <div class="acu-stage" id="acu-stage">
        <div class="body-diagram" id="body-diagram" style="width:280px; height:288px;">
          <svg viewBox="0 0 200 240" style="width:100%; height:100%; pointer-events:none;">
            <g fill="rgba(253, 230, 138, 0.14)" stroke="rgba(251, 191, 36, 0.55)" stroke-width="2.2" stroke-linejoin="round">
              <circle cx="100" cy="28" r="19" />
              <path d="M91,46 L91,56 L62,64 L44,126 L56,130 L72,82 L75,142 L68,224 L84,224 L96,154 L104,154 L116,224 L132,224 L125,142 L128,82 L144,130 L156,126 L138,64 L109,56 L109,46 Z" />
            </g>
            <line x1="100" y1="15" x2="100" y2="145" stroke="rgba(248, 113, 113, 0.35)" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="65" y1="68" x2="135" y2="68" stroke="rgba(248, 113, 113, 0.35)" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="78" y1="155" x2="76" y2="220" stroke="rgba(248, 113, 113, 0.35)" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="122" y1="155" x2="124" y2="220" stroke="rgba(248, 113, 113, 0.35)" stroke-width="1.5" stroke-dasharray="3,3" />
          </svg>
        </div>
      </div>
    `;
    const diagram = document.getElementById('body-diagram');
    const acuBanner = document.getElementById('acu-banner');

    const bodyAcupoints = [
      { name: '백회', xPct: 50, yPct: 9 },
      { name: '견정(좌)', xPct: 30, yPct: 27 },
      { name: '견정(우)', xPct: 70, yPct: 27 },
      { name: '단중', xPct: 50, yPct: 38 },
      { name: '중완', xPct: 50, yPct: 50 },
      { name: '합곡(좌)', xPct: 22, yPct: 54 },
      { name: '합곡(우)', xPct: 78, yPct: 54 },
      { name: '족삼리(좌)', xPct: 38, yPct: 74 },
      { name: '족삼리(우)', xPct: 62, yPct: 74 },
      { name: '태충(좌)', xPct: 38, yPct: 91 },
      { name: '태충(우)', xPct: 62, yPct: 91 }
    ];

    const movingForbiddens = [0, 1].map((idx) => {
      const el = document.createElement('div');
      el.className = 'acu-point';
      el.style.width = '42px';
      el.style.height = '42px';
      el.style.background = 'radial-gradient(circle, #7e22ce 35%, rgba(126,34,206,0.3) 75%, transparent 100%)';
      el.style.borderColor = '#e879f9';
      el.style.animation = 'none';
      el.style.zIndex = '8';
      el.innerHTML = `<span style="font-size:1rem;">🚫</span><span class="pt-label">금침</span>`;

      const fObj = {
        el,
        x: idx === 0 ? 40 : 190,
        y: idx === 0 ? 60 : 180,
        vx: idx === 0 ? 2.4 : -2.6,
        vy: idx === 0 ? 1.9 : -2.1
      };

      el.onpointerdown = (e) => {
        e.stopPropagation();
        combo = 0;
        engine.totalScore = Math.max(0, engine.totalScore - 100);
        engine.updateHud(timeLeft, combo, false);
        engine.triggerShake();
        showFloatingText(diagram, fObj.x, fObj.y - 16, '🚫 금침 적중! -100', '#e879f9');
      };

      diagram.appendChild(el);
      return fObj;
    });

    let activeTarget = null;
    let prescriptionQueue = [];
    let currentStepIdx = 0;
    let ringScale = 1.65;
    let roundCount = 0;

    const showNextAcupoint = () => {
      if (activeTarget) activeTarget.remove();

      const spot = prescriptionQueue[currentStepIdx];
      const orderNum = currentStepIdx + 1;
      const totalInRound = prescriptionQueue.length;
      ringScale = 1.65;

      acuBanner.innerHTML = `
        📍 Prescription #${roundCount}: Point ${orderNum} / ${totalInRound} (${spot.name})<br/>
        <span style="font-size:0.75rem; font-weight:normal;">황금 원이 겹칠 때 터치! 떠다니는 금침(🚫)을 피하세요!</span>
      `;

      const pt = document.createElement('div');
      pt.className = 'acu-point';
      pt.style.width = '50px';
      pt.style.height = '50px';
      pt.style.left = `calc(${spot.xPct}% - 25px)`;
      pt.style.top = `calc(${spot.yPct}% - 25px)`;
      pt.innerHTML = `
        <div class="timing-ring" style="position:absolute; inset:-15px; border:2.5px solid #facc15; border-radius:50%; pointer-events:none;"></div>
        <span style="font-size:1.1rem; font-weight:900; color:#fff;">${orderNum}</span>
        <span class="pt-label">${spot.name}</span>
      `;

      pt.onpointerdown = (e) => {
        e.stopPropagation();
        const rect = diagram.getBoundingClientRect();
        const stickX = (spot.xPct / 100) * rect.width;
        const stickY = (spot.yPct / 100) * rect.height;

        const isPerfect = ringScale >= 0.82 && ringScale <= 1.24;
        combo++;
        const gain = (isPerfect ? 190 : 120) + Math.min(100, combo * 15);
        engine.totalScore += gain;
        engine.updateHud(timeLeft, combo, true);

        const needle = document.createElement('div');
        needle.className = 'needle-stuck';
        needle.style.left = stickX + 'px';
        needle.style.top = stickY + 'px';
        needle.innerText = '📍';
        diagram.appendChild(needle);
        setTimeout(() => needle.remove(), 900);

        showFloatingText(diagram, Math.max(10, stickX - 30), Math.max(10, stickY - 28),
          isPerfect ? `⚡ PERFECT! +${gain}` : `✨ +${gain}`, isPerfect ? '#facc15' : '#4ade80');

        currentStepIdx++;
        if (currentStepIdx < prescriptionQueue.length) {
          showNextAcupoint();
        } else {
          const setBonus = totalInRound * 70;
          engine.totalScore += setBonus;
          engine.updateHud(timeLeft, combo, false);
          showFloatingText(diagram, rect.width / 2 - 68, 16, `🔥 ${totalInRound}혈 처방 완료! +${setBonus}`, '#38bdf8');
          startNewPrescriptionRound();
        }
      };

      diagram.appendChild(pt);
      activeTarget = pt;
    };

    const startNewPrescriptionRound = () => {
      roundCount++;
      const countOptions = [3, 4, 5];
      const count = countOptions[(roundCount - 1) % countOptions.length];
      prescriptionQueue = [...bodyAcupoints].sort(() => Math.random() - 0.5).slice(0, count);
      currentStepIdx = 0;
      showNextAcupoint();
    };

    engine.gameLoop = setInterval(() => {
      if (activeTarget) {
        ringScale -= 0.028;
        if (ringScale < 0.7) ringScale = 1.65;
        const ringEl = activeTarget.querySelector('.timing-ring');
        if (ringEl) {
          ringEl.style.transform = `scale(${ringScale})`;
          ringEl.style.borderColor = (ringScale >= 0.82 && ringScale <= 1.24) ? '#4ade80' : '#facc15';
        }
      }

      const maxW = diagram.clientWidth - 42;
      const maxH = diagram.clientHeight - 42;
      movingForbiddens.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x <= 6 || f.x >= maxW) f.vx *= -1;
        if (f.y <= 6 || f.y >= maxH) f.vy *= -1;
        f.el.style.left = f.x + 'px';
        f.el.style.top = f.y + 'px';
      });
    }, 24);

    diagram.onpointerdown = () => {
      combo = 0;
      engine.totalScore = Math.max(0, engine.totalScore - 50);
      engine.updateHud(timeLeft, combo, false);
      engine.triggerShake();
    };

    startNewPrescriptionRound();
  };

  startBrewPhase();
  engine.timerInterval = setInterval(() => {
    timeLeft--;
    engine.updateHud(timeLeft, combo);
    engine.updateCountdown(timeLeft);
    if (timeLeft <= 0) engine.nextStageOrEnd();
  }, 1000);
});