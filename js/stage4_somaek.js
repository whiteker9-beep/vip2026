GameEngine.registerStage(4, {
  badge: "STAGE 4 · K-DRINKING & MZ ESCAPE (술 & 회식 문화)",
  title: "Color-Match K-Cocktail & MZ Dinner Escape!",
  titleKo: "한국식 폭탄주 6종 재료 배합 & MZ 회식 탈출!",
  descEn: "Mix 3 trendy Korean bomb shots! Look at the colored dashed lines on each glass—hold the matching bottle (Green Soju, Gold Beer, White Makgeolli, Pink Fruit Soju, Yellow Honey, or Red Pomegranate Vinegar) to fill each layer! Then escape Round 3 Karaoke (🎤) and run home (🏠)!",
  descKo: "한국의 다채로운 폭탄주 레시피 도전! 잔에 표시된 점선 색깔(초록 소주·황금 맥주·하얀 막걸리·핑크 과일소주·노란 꿀·붉은 석류식초)에 맞춰 똑같은 색깔의 병을 꾹 눌러 3층 폭탄주 3잔을 완성한 뒤, 3차 노래방(🎤)을 피해 집(🏠)으로 칼퇴근하세요!",
  ruleEn: "1) Hold the bottle matching each dashed line color x3 cups. 2) Swipe or tap Left/Right to grab 🏠🚕 and dodge 🎤👔! (46s)",
  ruleKo: "1단계: 잔의 점선 색깔과 같은 병을 꾹 눌러 눈금 맞추기(3잔) → 2단계: 좌/우 스와이프·버튼으로 3차 피하고 집·택시 타기!",
  hint: "Hold the bottle matching the dashed line color! / 잔의 점선 색깔과 같은 병을 꾹 눌러 채우세요!"
}, (engine) => {
  engine.clearLoops();

  const area = document.getElementById('play-area');
  let timeLeft = 46, combo = 0;

  // 6가지 한국 폭탄주 핵심 재료 (고유 색상 + 이름 + 이모지)
  const INGREDIENTS = {
    SOJU:    { id: 'SOJU',    icon: '🍾', en: 'Soju',       ko: '소주',     color: '#22c55e', liquidBg: 'rgba(34, 197, 94, 0.65)' },
    BEER:    { id: 'BEER',    icon: '🍺', en: 'Beer',       ko: '맥주',     color: '#f59e0b', liquidBg: 'linear-gradient(to top, #d97706, #fbbf24)' },
    MAKGEO:  { id: 'MAKGEO',  icon: '🍶', en: 'Makgeolli',  ko: '막걸리',   color: '#f8fafc', liquidBg: 'rgba(248, 250, 252, 0.85)' },
    FRUIT:   { id: 'FRUIT',   icon: '🍑', en: 'Fruit Soju', ko: '과일소주', color: '#f472b6', liquidBg: 'rgba(244, 114, 182, 0.72)' },
    HONEY:   { id: 'HONEY',   icon: '🍯', en: 'Honey',      ko: '꿀',       color: '#eab308', liquidBg: 'rgba(234, 179, 8, 0.82)' },
    VINEGAR: { id: 'VINEGAR', icon: '🍷', en: 'Hongcho',    ko: '석류식초', color: '#ef4444', liquidBg: 'rgba(239, 68, 68, 0.75)' }
  };

  // 3잔의 다채로운 한국 폭탄주 레시피 (각 잔마다 3층 레이어 배합)
  const RECIPES = [
    {
      name: '홍초 쏘맥 (Hongcho Somaek)',
      layers: [
        { ing: 'SOJU',    targetPct: 30 },
        { ing: 'BEER',    targetPct: 68 },
        { ing: 'VINEGAR', targetPct: 90 }
      ]
    },
    {
      name: '꿀막비어 (Honey Mak-Beer)',
      layers: [
        { ing: 'HONEY',   targetPct: 26 },
        { ing: 'MAKGEO',  targetPct: 64 },
        { ing: 'BEER',    targetPct: 90 }
      ]
    },
    {
      name: '피치 쏘맥 폭탄 (Peach Somaek)',
      layers: [
        { ing: 'FRUIT',   targetPct: 32 },
        { ing: 'SOJU',    targetPct: 60 },
        { ing: 'BEER',    targetPct: 90 }
      ]
    }
  ];

  let cupIdx = 0;
  let layerIdx = 0;
  let currentFillPct = 0;
  let activeBottleId = null;

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
  // Phase 1: 점선 색깔 매칭 6종 재료 폭탄주 제조
  // ==========================================
  const initCocktailTable = () => {
    area.innerHTML = `
      <div class="top-banner" style="background:#78350f; color:#fde68a; padding:6px 8px;" id="mix-banner">
        🍹 Cup 1/3: <span id="recipe-title" style="color:#fff;">홍초 쏘맥</span><br/>
        <span style="font-size:0.74rem; font-weight:normal;" id="mix-sub">점선 색깔과 같은 병을 꾹 눌러 눈금까지 채우세요!</span>
      </div>

      <div class="somaek-stage" id="mix-stage" style="padding:8px 10px; justify-content:space-between;">
        <!-- 3개의 폭탄주 잔 -->
        <div class="glasses-row" style="height:132px; margin-top:2px; gap:12px;">
          ${[0, 1, 2].map(c => `
            <div class="cup-unit ${c === 0 ? 'active-cup' : ''}" id="cup-unit-${c}">
              <div class="shot-top" id="shot-${c}" style="height:16px; width:22px;"></div>
              <div class="beer-glass" id="glass-box-${c}" style="width:62px; height:106px; position:relative;">
                <!-- 층별 액체가 차오르는 컨테이너 -->
                <div id="layers-fill-${c}" style="position:absolute; inset:0;"></div>
                <!-- 층별 색깔 점선 가이드가 들어갈 컨테이너 -->
                <div id="layers-lines-${c}" style="position:absolute; inset:0; z-index:5;"></div>
              </div>
              <span style="font-size:0.68rem; color:#94a3b8; margin-top:3px; font-weight:bold;">Cup ${c + 1}</span>
            </div>
          `).join('')}
        </div>

        <!-- 6종 실물 병/재료 선택 그리드 (3열 x 2행) -->
        <div id="bottles-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; width:100%;">
          ${Object.values(INGREDIENTS).map(ing => `
            <button class="bottle-card" data-ing="${ing.id}" style="
              background:#0f172a; border:2px solid ${ing.color}; border-radius:10px;
              padding:6px 4px; display:flex; flex-direction:column; align-items:center;
              justify-content:center; cursor:pointer; touch-action:none; transition:transform 0.08s;
            ">
              <div style="font-size:1.45rem; line-height:1;">${ing.icon}</div>
              <div style="font-size:0.72rem; font-weight:900; color:${ing.color}; margin-top:2px;">${ing.en}</div>
              <div style="font-size:0.64rem; color:#cbd5e1;">${ing.ko}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const stageEl = document.getElementById('mix-stage');
    const banner = document.getElementById('mix-banner');
    const recipeTitleEl = document.getElementById('recipe-title');
    const mixSubEl = document.getElementById('mix-sub');

    // 각 잔에 3층 점선 가이드라인 그리기
    const renderCupGuides = (cIdx) => {
      const linesWrap = document.getElementById(`layers-lines-${cIdx}`);
      const recipe = RECIPES[cIdx];
      linesWrap.innerHTML = recipe.layers.map((ly, lIdx) => {
        const ing = INGREDIENTS[ly.ing];
        const isCurrentTarget = (cIdx === cupIdx && lIdx === layerIdx);
        return `
          <div id="guide-${cIdx}-${lIdx}" style="
            position:absolute; bottom:${ly.targetPct - 5}%; left:0; width:100%; height:10%;
            border-top:2.5px dashed ${ing.color}; border-bottom:2.5px dashed ${ing.color};
            background:${isCurrentTarget ? 'rgba(255,255,255,0.16)' : 'transparent'};
            box-shadow:${isCurrentTarget ? `0 0 10px ${ing.color}` : 'none'};
          "></div>
        `;
      }).join('');
    };

    [0, 1, 2].forEach(c => renderCupGuides(c));

    const updateTargetPrompt = () => {
      [0, 1, 2].forEach(c => {
        document.getElementById(`cup-unit-${c}`).classList.toggle('active-cup', c === cupIdx);
        renderCupGuides(c);
      });
      const rec = RECIPES[cupIdx];
      const targetLayer = rec.layers[layerIdx];
      const targetIng = INGREDIENTS[targetLayer.ing];

      recipeTitleEl.innerText = `${rec.name} (${cupIdx + 1}/3)`;
      mixSubEl.innerHTML = `Hold <strong style="color:${targetIng.color};">${targetIng.icon} ${targetIng.en} (${targetIng.ko})</strong> to the dashed line!`;
    };

    updateTargetPrompt();

    // 병 버튼 누르기 & 떼기 이벤트 연결
    document.querySelectorAll('.bottle-card').forEach(btn => {
      const ingId = btn.dataset.ing;

      btn.onpointerdown = (e) => {
        e.preventDefault();
        if (cupIdx >= 3) return;

        const targetLayer = RECIPES[cupIdx].layers[layerIdx];
        // 잘못된 색깔의 병을 눌렀을 때 즉시 감점 및 경고
        if (ingId !== targetLayer.ing) {
          combo = 0;
          engine.totalScore = Math.max(0, engine.totalScore - 50);
          engine.updateHud(timeLeft, combo, false);
          engine.triggerShake();
          const rightIng = INGREDIENTS[targetLayer.ing];
          showFloatingText(stageEl, 70, 95, `❌ ${rightIng.ko}(${rightIng.en}) 병을 누르세요! -50`, '#f87171');
          return;
        }

        // 올바른 병을 누름 -> 액체 채우기 시작
        activeBottleId = ingId;
        btn.style.transform = 'scale(0.93)';
        btn.style.background = 'rgba(255, 255, 255, 0.14)';

        // 현재 층의 액체 DOM이 없으면 생성
        const fillWrap = document.getElementById(`layers-fill-${cupIdx}`);
        let layerEl = document.getElementById(`fill-${cupIdx}-${layerIdx}`);
        if (!layerEl) {
          const prevPct = layerIdx === 0 ? 0 : RECIPES[cupIdx].layers[layerIdx - 1].targetPct;
          currentFillPct = prevPct;
          layerEl = document.createElement('div');
          layerEl.id = `fill-${cupIdx}-${layerIdx}`;
          layerEl.style.position = 'absolute';
          layerEl.style.bottom = prevPct + '%';
          layerEl.style.left = '0';
          layerEl.style.width = '100%';
          layerEl.style.height = '0%';
          layerEl.style.background = INGREDIENTS[ingId].liquidBg;
          fillWrap.appendChild(layerEl);
        }
      };

      const stopPouring = () => {
        btn.style.transform = 'scale(1)';
        btn.style.background = '#0f172a';
        if (!activeBottleId || activeBottleId !== ingId) return;
        activeBottleId = null;

        const targetLayer = RECIPES[cupIdx].layers[layerIdx];
        const diff = Math.abs(currentFillPct - targetLayer.targetPct);

        if (diff <= 9.5) {
          // 눈금 적중 성공!
          combo++;
          const isPerfect = diff <= 4;
          const gain = (isPerfect ? 160 : 110) + (combo * 15);
          engine.totalScore += gain;
          engine.updateHud(timeLeft, combo, true);
          showFloatingText(stageEl, 95, 85, isPerfect ? `⚡ PERFECT! +${gain}` : `✅ GOOD! +${gain}`, isPerfect ? '#facc15' : '#4ade80');
        } else {
          // 눈금 오차 발생 (다음 층으로 넘어가되 감점)
          combo = 0;
          engine.totalScore = Math.max(0, engine.totalScore - 40);
          engine.updateHud(timeLeft, combo, false);
          engine.triggerShake();
          showFloatingText(stageEl, 95, 85, currentFillPct > targetLayer.targetPct ? '💥 넘쳤어요! -40' : '⚠️ 부족해요! -40', '#f87171');
        }

        // 다음 층 또는 다음 잔으로 진행
        layerIdx++;
        if (layerIdx >= RECIPES[cupIdx].layers.length) {
          cupIdx++;
          layerIdx = 0;
          if (cupIdx < 3) {
            updateTargetPrompt();
          } else {
            // 3잔 모두 완성! 도미노 폭탄주 피날레 연출 후 회식 탈출 러너로 전환
            clearInterval(engine.gameLoop);
            engine.totalScore += 350;
            engine.updateHud(timeLeft, combo, false);
            banner.style.background = '#065f46';
            banner.style.color = '#6ee7b7';
            banner.innerHTML = `🍻 All 3 K-Cocktails Mixed! (+350) Now Escape Round 3!<br/><span style="font-size:0.74rem;">특제 폭탄주 3잔 완성! 이제 3차 노래방을 피해 집으로 칼퇴근하세요!</span>`;

            [0, 1, 2].forEach((idx) => {
              setTimeout(() => {
                const shotEl = document.getElementById(`shot-${idx}`);
                if (shotEl) shotEl.classList.add('shot-fallen');
              }, idx * 170);
            });

            setTimeout(() => { if (timeLeft > 0) start3LaneEscape(); }, 950);
          }
        } else {
          updateTargetPrompt();
        }
      };

      btn.onpointerup = stopPouring;
      btn.onpointerleave = stopPouring;
    });

    // 누르고 있는 동안 해당 층의 액체가 차오르는 루프
    engine.gameLoop = setInterval(() => {
      if (!activeBottleId || cupIdx >= 3) return;
      const prevPct = layerIdx === 0 ? 0 : RECIPES[cupIdx].layers[layerIdx - 1].targetPct;
      const speed = 1.65 + (cupIdx * 0.25);
      currentFillPct += speed;

      const layerEl = document.getElementById(`fill-${cupIdx}-${layerIdx}`);
      if (layerEl) {
        layerEl.style.height = Math.max(0, currentFillPct - prevPct) + '%';
      }

      // 100% 끝까지 넘치면 강제 정지
      if (currentFillPct >= 100) {
        const activeBtn = document.querySelector(`.bottle-card[data-ing="${activeBottleId}"]`);
        if (activeBtn) activeBtn.onpointerup();
      }
    }, 22);
  };

  // ==========================================
  // Phase 2: MZ 사원 회식 탈출 러너 (귀가 게이지 + 택시 부스터 + 스와이프/버튼 조작)
  // ==========================================
  const start3LaneEscape = () => {
    clearInterval(engine.gameLoop);
    const escapeStartTime = timeLeft;

    area.innerHTML = `
      <div class="top-banner" style="background:#312e81; color:#e0e7ff; padding:6px 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-bottom:4px;">
          <span>🍻 Dinner</span>
          <span style="color:#facc15; font-weight:900;">🏃‍♂️ RUN HOME! (칼퇴근 질주)</span>
          <span>🏠 Home</span>
        </div>
        <div style="width:100%; height:6px; background:#1e1b4b; border-radius:4px; overflow:hidden;">
          <div id="home-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #38bdf8, #4ade80); transition:width 0.3s;"></div>
        </div>
      </div>

      <div class="lanes-wrap" id="lanes-wrap" style="height:calc(100% - 88px);">
        <div id="mz-cutscene">
          <div class="boss-bubble">
            👔 Boss: "Amazing K-cocktails! Now Round 3 Karaoke (🎤)!!"<br/>
            <span style="font-size:0.78rem; font-weight:normal;">부장님: "폭탄주 솜씨가 예술이네! 자, 이제 3차 노래방 가자!!"</span>
          </div>
          <div class="mz-bubble">
            🧑‍💻 Gen-Z Worker: "No thanks! Catching a TAXI (🚕) HOME (🏠)!!"<br/>
            <span style="font-size:0.8rem; font-weight:normal;">MZ 사원: "죄송합니다! 저는 택시(🚕) 타고 집(🏠)으로 칼퇴근합니다!!"</span>
          </div>
        </div>
        <div class="lane"></div><div class="lane"></div><div class="lane"></div>
        <div id="mz-runner" style="left:33.33%;">
          <span style="font-size:36px; line-height:1;" id="runner-emoji">🏃‍♂️</span>
          <span class="runner-tag" id="runner-tag">MZ 사원</span>
        </div>
      </div>

      <div class="lane-controls">
        <button class="lane-btn" id="btn-left">◀ LEFT / 왼쪽</button>
        <button class="lane-btn" id="btn-right">RIGHT / 오른쪽 ▶</button>
      </div>
    `;

    const cutscene = document.getElementById('mz-cutscene');
    const wrap = document.getElementById('lanes-wrap');
    const runner = document.getElementById('mz-runner');
    const runnerEmoji = document.getElementById('runner-emoji');
    const runnerTag = document.getElementById('runner-tag');
    const progressBar = document.getElementById('home-progress-bar');

    let currentLane = 1, isPlayingRunner = false, touchStartX = 0;

    setTimeout(() => {
      if (cutscene) {
        cutscene.style.opacity = '0';
        setTimeout(() => {
          if (cutscene) cutscene.remove();
          isPlayingRunner = true;
        }, 280);
      }
    }, 1500);

    const setLane = (l) => {
      currentLane = Math.max(0, Math.min(2, l));
      runner.style.left = (currentLane * 33.33) + '%';
    };

    document.getElementById('btn-left').onpointerdown = () => setLane(currentLane - 1);
    document.getElementById('btn-right').onpointerdown = () => setLane(currentLane + 1);

    wrap.onpointerdown = (e) => {
      touchStartX = e.clientX;
      const rect = wrap.getBoundingClientRect();
      const clickedLane = Math.floor(((e.clientX - rect.left) / rect.width) * 3);
      setLane(clickedLane);
    };
    wrap.onpointermove = (e) => {
      if (!touchStartX) return;
      const dx = e.clientX - touchStartX;
      if (dx < -28) { setLane(currentLane - 1); touchStartX = e.clientX; }
      else if (dx > 28) { setLane(currentLane + 1); touchStartX = e.clientX; }
    };
    wrap.onpointerup = () => { touchStartX = 0; };

    let objs = [], tick = 0;
    engine.gameLoop = setInterval(() => {
      if (!isPlayingRunner) return;
      tick++;

      if (escapeStartTime > 0 && progressBar) {
        const pct = Math.min(100, Math.round(((escapeStartTime - timeLeft) / escapeStartTime) * 100));
        progressBar.style.width = pct + '%';
      }

      const spawnInterval = timeLeft > 10 ? 21 : 17;
      if (tick % spawnInterval === 0) {
        const lane = Math.floor(Math.random() * 3);
        const roll = Math.random();
        let itemData;

        if (roll < 0.30) {
          itemData = { icon: '🏠', label: 'HOME (+160)', type: 'HOME' };
        } else if (roll < 0.48) {
          itemData = { icon: '🚕', label: 'TAXI (+230)', type: 'TAXI' };
        } else if (roll < 0.68) {
          itemData = { icon: '🎤', label: '3차 노래방!', type: 'TRAP' };
        } else if (roll < 0.85) {
          itemData = { icon: '👔', label: '부장님 호출!', type: 'TRAP' };
        } else {
          itemData = { icon: '🍻', label: '한 잔 더!', type: 'TRAP' };
        }

        const isGood = itemData.type !== 'TRAP';
        const el = document.createElement('div');
        el.className = 'road-item';
        el.style.left = (lane * 33.33) + '%';
        el.style.top = '-10px';
        el.innerHTML = `
          <span style="font-size:32px; line-height:1;">${itemData.icon}</span>
          <span class="road-badge ${isGood ? 'badge-good' : 'badge-trap'}">${itemData.label}</span>
        `;
        wrap.appendChild(el);
        objs.push({ el, lane, y: -10, itemData });
      }

      const maxH = wrap.clientHeight;
      const runSpeed = timeLeft > 10 ? 6.4 : 7.8;

      for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        o.y += runSpeed;
        o.el.style.top = o.y + 'px';

        if (o.y >= maxH - 72 && o.y <= maxH - 12 && o.lane === currentLane) {
          const hitX = (currentLane * (wrap.clientWidth / 3)) + 16;
          if (o.itemData.type === 'HOME') {
            combo++;
            const gain = 160 + (combo * 20);
            engine.totalScore += gain;
            showFloatingText(wrap, hitX, maxH - 85, `🏠 +${gain}`, '#4ade80');
            runner.style.transform = 'scale(1.18)';
            setTimeout(() => { if (runner) runner.style.transform = 'scale(1)'; }, 120);
            engine.updateHud(timeLeft, combo, true);
          } else if (o.itemData.type === 'TAXI') {
            combo++;
            const gain = 230 + (combo * 25);
            engine.totalScore += gain;
            showFloatingText(wrap, hitX, maxH - 85, `🚕 TAXI! +${gain}`, '#facc15');
            runnerEmoji.innerText = '🚕';
            runnerTag.innerText = '칼퇴근 중!';
            runnerTag.style.background = '#f59e0b';
            setTimeout(() => {
              if (runnerEmoji) runnerEmoji.innerText = '🏃‍♂️';
              if (runnerTag) { runnerTag.innerText = 'MZ 사원'; runnerTag.style.background = '#3b82f6'; }
            }, 650);
            engine.updateHud(timeLeft, combo, true);
          } else {
            combo = 0;
            engine.totalScore = Math.max(0, engine.totalScore - 140);
            showFloatingText(wrap, hitX, maxH - 85, '😱 -140', '#f87171');
            engine.triggerShake();
            engine.updateHud(timeLeft, combo, false);
          }
          o.el.remove();
          objs.splice(i, 1);
        } else if (o.y > maxH) {
          o.el.remove();
          objs.splice(i, 1);
        }
      }
    }, 22);
  };

  initCocktailTable();
  engine.timerInterval = setInterval(() => {
    timeLeft--;
    engine.updateHud(timeLeft, combo);
    engine.updateCountdown(timeLeft);
    if (timeLeft <= 0) engine.nextStageOrEnd();
  }, 1000);
});