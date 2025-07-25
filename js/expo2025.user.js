// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-07-25
// @description  try to take over the world!
// @author       You
// @match        https://ticket.expo2025.or.jp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=expo2025.or.jp
// @grant        none
// ==/UserScript==

    (function() {
        'use strict';

        // イベント選択ダイアログを作成
        function createEventSelectDialog() {
            // ダイアログのオーバーレイを作成
            const overlay = document.createElement('div');
            overlay.id = 'event-select-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // ダイアログコンテンツを作成
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                background-color: white;
                border-radius: 10px;
                padding: 0;
                min-width: 350px;
                max-width: 80%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            `;
            
            // ダイアログヘッダー（ドラッグ可能エリア）を作成
            const dialogHeader = document.createElement('div');
            dialogHeader.style.cssText = `
                background-color: #f8f9fa;
                border-radius: 10px 10px 0 0;
                padding: 15px 30px;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid #dee2e6;
                position: relative;
                flex-shrink: 0;
            `;
            
            // ダイアログボディを作成
            const dialogBody = document.createElement('div');
            dialogBody.style.cssText = `
                padding: 30px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            `;
            
            // ダイアログの内容
            dialogHeader.innerHTML = `
                <h2 style="margin: 0; color: #333; font-family: Arial, sans-serif; text-align: center;">イベント選択</h2>
                <button id="event-close-button" style="
                    position: absolute;
                    top: 50%;
                    right: 15px;
                    transform: translateY(-50%);
                    width: 25px;
                    height: 25px;
                    border: none;
                    border-radius: 50%;
                    background-color: #dc3545;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    z-index: 1;
                ">✕</button>
            `;
            
            dialogBody.innerHTML = `
                    </div>
                    <div style="margin-bottom: 20px; max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 15px; -webkit-overflow-scrolling: touch;">
                        <div id="event-list" style="overflow-y: auto; -webkit-overflow-scrolling: touch;">
                            <!-- イベントリストはJavaScriptで動的に生成 -->
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <button id="confirm-event" style="
                            background-color: #28a745;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-right: 10px;
                            font-family: Arial, sans-serif;
                        ">確定</button>
                        <button id="cancel-event" style="
                            background-color: #6c757d;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                        ">キャンセル</button>
                    </div>
            `;
            
            // ダイアログの構造を組み立て
            dialog.appendChild(dialogHeader);
            dialog.appendChild(dialogBody);
            overlay.appendChild(dialog);
            
            // ドラッグ機能を追加
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };
            
            // 背景スクロールを無効化
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // タッチイベントの伝播を防ぐ
            overlay.addEventListener('touchmove', function(e) {
                // ドラッグ中でない場合のみ背景スクロールを防ぐ
                if (!isDragging) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // ダイアログ内のタッチイベントは通常通り動作させる（スクロール可能エリア以外）
            dialog.addEventListener('touchmove', function(e) {
                // ドラッグ中の場合は処理をスキップ
                if (isDragging) {
                    return;
                }
                
                // スクロール可能エリア内の場合は通常のスクロール動作を許可
                const target = e.target;
                const scrollableElement = target.closest('#event-list');
                if (!scrollableElement) {
                    e.stopPropagation();
                }
            });
            
            // スクロール可能エリアでのタッチイベントを明示的に処理
            const scrollableAreas = dialog.querySelectorAll('#event-list');
            scrollableAreas.forEach(area => {
                area.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                }, { passive: true });
                
                area.addEventListener('touchmove', function(e) {
                    e.stopPropagation();
                }, { passive: true });
                
                area.addEventListener('touchend', function(e) {
                    e.stopPropagation();
                }, { passive: true });
            });
            
            // マウスイベント（PC用）
            dialogHeader.addEventListener('mousedown', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#event-close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
            });
            
            // タッチイベント（スマホ用）
            dialogHeader.addEventListener('touchstart', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#event-close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                const touch = e.touches[0];
                dragOffset.x = touch.clientX - rect.left;
                dragOffset.y = touch.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    const x = e.clientX - dragOffset.x;
                    const y = e.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                }
            });
            
            // タッチムーブイベント（スマホ用）
            document.addEventListener('touchmove', function(e) {
                if (isDragging) {
                    const touch = e.touches[0];
                    const x = touch.clientX - dragOffset.x;
                    const y = touch.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // タッチエンドイベント（スマホ用）
            document.addEventListener('touchend', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // イベント一覧データ
            const eventList = [
                { "event_code": "C2N0", "event_name": "イタリアパビリオン also hosting the Holy See ～15:00" },
                { "event_code": "C2N3", "event_name": "イタリアパビリオン also hosting the Holy See 15:00～" },
                { "event_code": "C730", "event_name": "オーストラリアパビリオン 「Chasing the Sun ― 太陽の大地へ」" },
                { "event_code": "C7R0", "event_name": "オランダパビリオン　コモングラウンド" },
                { "event_code": "C9J0", "event_name": "韓国館" },
                { "event_code": "CCB0", "event_name": "クウェート国パビリオン" },
                { "event_code": "CFR0", "event_name": "国際赤十字・赤新月運動館" },
                { "event_code": "CFV0", "event_name": "国連パビリオン" },
                { "event_code": "CO70", "event_name": "タイパビリオン（一般入館）" },
                { "event_code": "D630", "event_name": "ポーランドパビリオン" },
                { "event_code": "D633", "event_name": "ポーランドパビリオン：ショパンコンサート（コンサートホール入場のみ）開始時間(15時17時19時)の10分前集合。途中入場不可。" },
                { "event_code": "H1H9", "event_name": "日本館　3エリア観覧" },
                { "event_code": "H3H0", "event_name": "ウーマンズ パビリオン in collaboration with Cartier" },
                { "event_code": "H5H0", "event_name": "大阪ヘルスケアパビリオン（本館）　リボーン体験" },
                { "event_code": "H5H3", "event_name": "大阪ヘルスケアパビリオン（本館）　リボーン体験＋人生ゲームREBORN in 2050" },
                { "event_code": "H5H9", "event_name": "大阪ヘルスケアパビリオン(XD HALL)モンスターハンター ブリッジ" },
                { "event_code": "H7H0", "event_name": "関西パビリオン" },
                { "event_code": "HAH0", "event_name": "NTT Pavilion※予約時間の15分前集合" },
                { "event_code": "HCH0", "event_name": "電力館　　※予約時間の１０分前集合" },
                { "event_code": "HEH0", "event_name": "住友館" },
                { "event_code": "HEH6", "event_name": "植林体験イベント（お子様向け）　【「住友館」枠とは別プログラム】" },
                { "event_code": "HGH0", "event_name": "パナソニック館 「ノモの国」" },
                { "event_code": "HIH0", "event_name": "三菱未来館 JOURNEY TO LIFE" },
                { "event_code": "HKH0", "event_name": "よしもとwaraii myraii館（球体内鑑賞）" },
                { "event_code": "HMH0", "event_name": "PASONA NATUREVERSE" },
                { "event_code": "HOH0", "event_name": "ブルーオーシャンドーム" },
                { "event_code": "HQH0", "event_name": "GUNDAM NEXT FUTURE PAVILION" },
                { "event_code": "HSH0", "event_name": "TECH WORLD館" },
                { "event_code": "HUH0", "event_name": "ガスパビリオン・おばけワンダーランド/XRゴーグル(利用制限あり)" },
                { "event_code": "HUH6", "event_name": "ガスパビリオン・おばけワンダーランド/スマートデバイス" },
                { "event_code": "HWH0", "event_name": "飯田グループ×大阪公立大学共同出展館" },
                { "event_code": "I300", "event_name": "シグネチャーパビリオン 宮田裕章 「Better Co-Being」" },
                { "event_code": "I600", "event_name": "シグネチャーパビリオン 石黒浩「いのちの未来」　一般" },
                { "event_code": "I606", "event_name": "シグネチャーパビリオン 石黒浩「いのちの未来」 インクルーシブ" },
                { "event_code": "I900", "event_name": "シグネチャーパビリオン 中島さち子 「いのちの遊び場 クラゲ館」 " },
                { "event_code": "I906", "event_name": "シグネチャーパビリオン 中島さち子 「いのちの遊び場 クラゲ館」English Only 枠" },
                { "event_code": "I90C", "event_name": "シグネチャーパビリオン 中島さち子 「いのちの遊び場 クラゲ館」ワイワイぺちゃくちゃ枠" },
                { "event_code": "IC00", "event_name": "シグネチャーパビリオン 落合陽一  「null²」ダイアログモード" },
                { "event_code": "IF00", "event_name": "シグネチャーパビリオン　福岡伸一　「いのち動的平衡館」" },
                { "event_code": "II00", "event_name": "*13歳以上*シグネチャーパビリオン 河森正治 「いのちめぐる冒険」 超時空シアター" },
                { "event_code": "II06", "event_name": "シグネチャーパビリオン 河森正治 「いのちめぐる冒険」 ANIMA! 床振動演出あり" },
                { "event_code": "IL00", "event_name": "シグネチャーパビリオン　小山薫堂　「EARTH MART」" },
                { "event_code": "IO00", "event_name": "シグネチャーパビリオン　河瀨直美「Dialogue Theater - いのちのあかし -」" },
                { "event_code": "J900", "event_name": "「未来の都市」 参加型シアター入場付き" },
                { "event_code": "J903", "event_name": "「未来の都市」 参加型シアター入場なし" },
                { "event_code": "JC00", "event_name": "空飛ぶクルマ ステーション" },
                { "event_code": "M1PD", "event_name": "大阪ウィーク～夏～OSAKA MUSIC LOVER -JAPANIMATION ROCKS- 一般" },
                { "event_code": "Q001", "event_name": "『アオと夜の虹のパレード』 Presented by SUNTORY｜DAIKIN　予約観覧エリア" },
                { "event_code": "Q007", "event_name": "万博サウナ 太陽のつぼみ 90分男性" },
                { "event_code": "Q010", "event_name": "万博サウナ 太陽のつぼみ 90分女性" },
                { "event_code": "Q013", "event_name": "万博サウナ 太陽のつぼみ 90分男女混合グループ" }
            ];
            
            // イベントリストを動的に生成
            const eventListContainer = dialogBody.querySelector('#event-list');
            
            // ローカルストレージから選択状態を復元
            let selectedEventCodes = [];
            try {
                const savedEvents = localStorage.getItem('selectedEventsForSchedule');
                if (savedEvents) {
                    const parsedEvents = JSON.parse(savedEvents);
                    selectedEventCodes = parsedEvents.map(event => event.event_code);
                    // グローバル変数も更新
                    window.selectedEventsForSchedule = parsedEvents;
                }
            } catch (e) {
                console.warn('ローカルストレージからの読み込みに失敗しました:', e);
            }
            
            // フォールバック: グローバル変数から取得
            if (selectedEventCodes.length === 0) {
                selectedEventCodes = (window.selectedEventsForSchedule || []).map(event => event.event_code);
            }
            
            eventList.forEach(event => {
                const isSelected = selectedEventCodes.includes(event.event_code);
                
                const eventItem = document.createElement('div');
                eventItem.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    padding: 8px;
                    border-radius: 4px;
                    background-color: #f9f9f9;
                `;
                
                eventItem.innerHTML = `
                    <div style="flex: 1; margin-right: 15px;">
                        <div style="font-weight: bold; color: #333; font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 2px;">
                            ${event.event_name}
                        </div>
                        <div style="color: #555; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4;">
                            ${event.event_code}
                        </div>
                    </div>
                    <label class="event-toggle-switch" style="position: relative; display: inline-block; width: 44px; height: 20px; flex-shrink: 0;">
                        <input type="checkbox" data-event-code="${event.event_code}" ${isSelected ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span class="event-slider" style="
                            position: absolute;
                            cursor: pointer;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: ${isSelected ? '#007bff' : '#ccc'};
                            transition: .3s;
                            border-radius: 20px;
                        ">
                            <span class="event-handle" style="
                                position: absolute;
                                content: '';
                                height: 16px;
                                width: 16px;
                                left: ${isSelected ? '26px' : '2px'};
                                bottom: 2px;
                                background-color: white;
                                transition: .3s;
                                border-radius: 50%;
                            "></span>
                        </span>
                    </label>
                `;
                
                eventListContainer.appendChild(eventItem);
            });
            
            // イベントトグルスイッチのクリックイベントを追加
            const eventToggleSwitches = dialog.querySelectorAll('.event-toggle-switch');
            eventToggleSwitches.forEach(switchElement => {
                switchElement.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    const slider = this.querySelector('.event-slider');
                    const handle = this.querySelector('.event-handle');
                    
                    checkbox.checked = !checkbox.checked;
                    
                    if (checkbox.checked) {
                        slider.style.backgroundColor = '#007bff';
                        handle.style.left = '26px';
                    } else {
                        slider.style.backgroundColor = '#ccc';
                        handle.style.left = '2px';
                    }
                });
            });
            
            // スクロール可能エリアのタッチスクロール最適化（イベントリスト生成後に実行）
            setTimeout(() => {
                const eventListElement = dialog.querySelector('#event-list');
                if (eventListElement) {
                    // スクロール可能エリア内でのタッチイベントを最適化
                    eventListElement.addEventListener('touchstart', function(e) {
                        e.stopPropagation();
                    }, { passive: true });
                    
                    eventListElement.addEventListener('touchmove', function(e) {
                        e.stopPropagation();
                    }, { passive: true });
                    
                    eventListElement.addEventListener('touchend', function(e) {
                        e.stopPropagation();
                    }, { passive: true });
                    
                    // 親コンテナも同様に処理
                    const scrollableContainer = eventListElement.parentElement;
                    if (scrollableContainer) {
                        scrollableContainer.addEventListener('touchstart', function(e) {
                            e.stopPropagation();
                        }, { passive: true });
                        
                        scrollableContainer.addEventListener('touchmove', function(e) {
                            e.stopPropagation();
                        }, { passive: true });
                        
                        scrollableContainer.addEventListener('touchend', function(e) {
                            e.stopPropagation();
                        }, { passive: true });
                    }
                }
            }, 10);
            
            // クローズイベントを追加
            const closeEventDialog = function() {
                // 背景スクロールを復元
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                
                overlay.style.opacity = '0';
                dialog.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            };
            
            // 確定ボタンのイベント
            dialog.querySelector('#confirm-event').addEventListener('click', function() {
                const selectedEvents = [];
                const checkboxes = dialog.querySelectorAll('input[type="checkbox"][data-event-code]');
                
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        const eventCode = checkbox.getAttribute('data-event-code');
                        const eventData = eventList.find(event => event.event_code === eventCode);
                        if (eventData) {
                            selectedEvents.push(eventData);
                        }
                    }
                });
                
                if (selectedEvents.length === 0) {
                    alert('少なくとも1つのイベントを選択してください');
                    return;
                }
                
                // 選択されたイベントをグローバル変数に保存
                window.selectedEventsForSchedule = selectedEvents;
                
                // ローカルストレージにも保存して永続化
                try {
                    localStorage.setItem('selectedEventsForSchedule', JSON.stringify(selectedEvents));
                } catch (e) {
                    console.warn('ローカルストレージへの保存に失敗しました:', e);
                }
                
                // イベント選択時点でURLを生成
                if (window.generateApiUrls) {
                    window.generateApiUrls(selectedEvents);
                }
                
                closeEventDialog();
                
                // 設定ダイアログのテーブルを更新
                setTimeout(() => {
                    const tableContainer = document.getElementById('event-schedule-table');
                    if (tableContainer && window.generateScheduleTableFromSettings) {
                        window.generateScheduleTableFromSettings();
                    }
                }, 100);
            });
            
            // キャンセルボタンのイベント
            dialog.querySelector('#cancel-event').addEventListener('click', closeEventDialog);
            
            // ✕ボタンのイベントハンドラーを追加
            dialog.querySelector('#event-close-button').addEventListener('click', closeEventDialog);
            
            // ✕ボタンのホバーエフェクトを追加
            const eventCloseButton = dialogHeader.querySelector('#event-close-button');
            eventCloseButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#c82333';
                this.style.transform = 'translateY(-50%) scale(1.1)';
            });
            eventCloseButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#dc3545';
                this.style.transform = 'translateY(-50%) scale(1)';
            });
            
            // ✕ボタンのタッチイベントを追加（スマホ対応）
            eventCloseButton.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
            eventCloseButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeEventDialog();
            }, { passive: false });
            
            // オーバーレイクリックで閉じる
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeEventDialog();
                }
            });
            
            // ESCキーで閉じる
            const escKeyHandler = function(e) {
                if (e.key === 'Escape') {
                    closeEventDialog();
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
            
            // ダイアログを表示
            document.body.appendChild(overlay);
            
            // アニメーション開始
            setTimeout(() => {
                overlay.style.opacity = '1';
                dialog.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            return overlay;
        }

        // 設定ダイアログを作成
        function createSettingsConfigDialog() {
            // ダイアログのオーバーレイを作成
            const overlay = document.createElement('div');
            overlay.id = 'settings-config-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10002;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // ダイアログコンテンツを作成
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                background-color: white;
                border-radius: 10px;
                padding: 0;
                min-width: 400px;
                max-width: 80%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            `;
            
            // ダイアログヘッダー（ドラッグ可能エリア）を作成
            const dialogHeader = document.createElement('div');
            dialogHeader.style.cssText = `
                background-color: #f8f9fa;
                border-radius: 10px 10px 0 0;
                padding: 15px 30px;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid #dee2e6;
                position: relative;
                flex-shrink: 0;
            `;
            
            // ダイアログボディを作成
            const dialogBody = document.createElement('div');
            dialogBody.style.cssText = `
                padding: 30px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            `;
            
            // ダイアログの内容
            dialogHeader.innerHTML = `
                <h2 style="margin: 0; color: #333; font-family: Arial, sans-serif; text-align: center;">設定</h2>
                <button id="settings-close-button" style="
                    position: absolute;
                    top: 50%;
                    right: 15px;
                    transform: translateY(-50%);
                    width: 25px;
                    height: 25px;
                    border: none;
                    border-radius: 50%;
                    background-color: #dc3545;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    z-index: 1;
                ">✕</button>
            `;
            
            dialogBody.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #555; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">チケットID</label>
                            <input type="text" id="config-ticket-id" placeholder="チケットIDを入力してください" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box;"
                                   value="${window.savedTicketId || ''}">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #555; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">入場日</label>
                            <input type="date" id="config-entrance-date" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box;"
                                   value="${window.savedEntranceDate || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; color: #555; font-family: Arial, sans-serif;">
                            <span>自動取得</span>
                            <label class="config-toggle-switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${window.autoReload ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                <span class="slider" style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: ${window.autoReload ? '#007bff' : '#ccc'};
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span class="handle" style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: ${window.autoReload ? '29px' : '3px'};
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #555; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">取得間隔（秒）</label>
                            <input type="number" id="config-interval" min="1" step="1" placeholder="取得間隔を入力してください" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box;"
                                   value="${window.savedInterval || '5'}">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #555; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">自動予約範囲時間</label>
                            <input type="time" id="config-auto-reserve-time" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box;"
                                   value="${window.savedAutoReserveTime || '03:00'}">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; color: #555; font-family: Arial, sans-serif;">
                            <span>現在時刻以降を表示</span>
                            <label class="config-time-filter-toggle-switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" ${window.showAfterCurrentTime ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                <span class="slider" style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: ${window.showAfterCurrentTime ? '#007bff' : '#ccc'};
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span class="handle" style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: ${window.showAfterCurrentTime ? '29px' : '3px'};
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <button id="save-settings" style="
                            background-color: #28a745;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-right: 10px;
                            font-family: Arial, sans-serif;
                        ">保存</button>
                        <button id="cancel-settings" style="
                            background-color: #6c757d;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                        ">キャンセル</button>
                    </div>
            `;
            
            // ダイアログの構造を組み立て
            dialog.appendChild(dialogHeader);
            dialog.appendChild(dialogBody);
            overlay.appendChild(dialog);
            
            // ドラッグ機能を追加
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };
            
            // 背景スクロールを無効化
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // タッチイベントの伝播を防ぐ
            overlay.addEventListener('touchmove', function(e) {
                // ドラッグ中でない場合のみ背景スクロールを防ぐ
                if (!isDragging) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // ダイアログ内のタッチイベントは通常通り動作させる
            dialog.addEventListener('touchmove', function(e) {
                // ドラッグ中の場合は処理をスキップ
                if (!isDragging) {
                    e.stopPropagation();
                }
            });
            
            // マウスイベント（PC用）
            dialogHeader.addEventListener('mousedown', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#settings-close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
            });
            
            // タッチイベント（スマホ用）
            dialogHeader.addEventListener('touchstart', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#settings-close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                const touch = e.touches[0];
                dragOffset.x = touch.clientX - rect.left;
                dragOffset.y = touch.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    const x = e.clientX - dragOffset.x;
                    const y = e.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                }
            });
            
            // タッチムーブイベント（スマホ用）
            document.addEventListener('touchmove', function(e) {
                if (isDragging) {
                    const touch = e.touches[0];
                    const x = touch.clientX - dragOffset.x;
                    const y = touch.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // タッチエンドイベント（スマホ用）
            document.addEventListener('touchend', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // スイッチのクリックイベントを追加
            const configToggleSwitches = dialog.querySelectorAll('.config-toggle-switch');
            configToggleSwitches.forEach(switchElement => {
                switchElement.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    const slider = this.querySelector('.slider');
                    const handle = this.querySelector('.handle');
                    
                    checkbox.checked = !checkbox.checked;
                    
                    if (checkbox.checked) {
                        slider.style.backgroundColor = '#007bff';
                        handle.style.left = '29px';
                    } else {
                        slider.style.backgroundColor = '#ccc';
                        handle.style.left = '3px';
                    }
                });
            });
            
            // 時間フィルタートグルスイッチのクリックイベントを追加
            const configTimeFilterToggleSwitches = dialog.querySelectorAll('.config-time-filter-toggle-switch');
            configTimeFilterToggleSwitches.forEach(switchElement => {
                switchElement.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    const slider = this.querySelector('.slider');
                    const handle = this.querySelector('.handle');
                    
                    checkbox.checked = !checkbox.checked;
                    
                    if (checkbox.checked) {
                        slider.style.backgroundColor = '#007bff';
                        handle.style.left = '29px';
                    } else {
                        slider.style.backgroundColor = '#ccc';
                        handle.style.left = '3px';
                    }
                });
            });
            
            // クローズイベントを追加
            const closeSettingsDialog = function() {
                // 背景スクロールを復元
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                
                overlay.style.opacity = '0';
                dialog.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            };
            
            // 保存ボタンのイベント
            dialog.querySelector('#save-settings').addEventListener('click', function() {
                // チケットIDの値を保存
                const ticketIdInput = dialog.querySelector('#config-ticket-id');
                window.savedTicketId = ticketIdInput.value.trim();
                localStorage.setItem('savedTicketId', window.savedTicketId);
                
                // 入場日の値を保存
                const entranceDateInput = dialog.querySelector('#config-entrance-date');
                window.savedEntranceDate = entranceDateInput.value || new Date().toISOString().split('T')[0];
                localStorage.setItem('savedEntranceDate', window.savedEntranceDate);
                
                // 取得間隔の値を保存
                const intervalInput = dialog.querySelector('#config-interval');
                const intervalValue = parseInt(intervalInput.value) || 5;
                window.savedInterval = Math.max(1, intervalValue); // 最小値1秒
                localStorage.setItem('savedInterval', window.savedInterval.toString());
                
                // 自動予約範囲時間の値を保存
                const autoReserveTimeInput = dialog.querySelector('#config-auto-reserve-time');
                window.savedAutoReserveTime = autoReserveTimeInput.value || '03:00';
                localStorage.setItem('savedAutoReserveTime', window.savedAutoReserveTime);
                
                // 自動取得の値を保存
                const autoReloadCheckbox = dialog.querySelector('.config-toggle-switch input[type="checkbox"]');
                window.autoReload = autoReloadCheckbox.checked;
                localStorage.setItem('autoReload', window.autoReload.toString());
                
                // 時間フィルターの値を保存
                const timeFilterCheckbox = dialog.querySelector('.config-time-filter-toggle-switch input[type="checkbox"]');
                window.showAfterCurrentTime = timeFilterCheckbox.checked;
                localStorage.setItem('showAfterCurrentTime', window.showAfterCurrentTime.toString());
                
                // 自動取得機能を更新
                if (window.toggleAutoReload) {
                    window.toggleAutoReload();
                } else {
                    // メイン設定ダイアログが開かれていない場合は、グローバル変数のみ更新
                    console.log('自動取得設定を保存しました。メイン画面で反映されます。');
                }
                
                // イベントが選択されていればURLを再生成
                if (window.selectedEventsForSchedule && window.selectedEventsForSchedule.length > 0 && window.generateApiUrls) {
                    window.generateApiUrls(window.selectedEventsForSchedule);
                }
                
                // テーブルを再生成
                if (window.generateScheduleTableFromSettings) {
                    window.generateScheduleTableFromSettings();
                }
                
                closeSettingsDialog();
            });
            
            // キャンセルボタンのイベント
            dialog.querySelector('#cancel-settings').addEventListener('click', closeSettingsDialog);
            
            // ✕ボタンのイベントハンドラーを追加
            dialog.querySelector('#settings-close-button').addEventListener('click', closeSettingsDialog);
            
            // ✕ボタンのホバーエフェクトを追加
            const closeButton = dialogHeader.querySelector('#settings-close-button');
            closeButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#c82333';
                this.style.transform = 'translateY(-50%) scale(1.1)';
            });
            closeButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#dc3545';
                this.style.transform = 'translateY(-50%) scale(1)';
            });
            
            // ✕ボタンのタッチイベントを追加（スマホ対応）
            closeButton.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
            closeButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeSettingsDialog();
            }, { passive: false });
            
            // オーバーレイクリックで閉じる
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeSettingsDialog();
                }
            });
            
            // ESCキーで閉じる
            const escKeyHandler = function(e) {
                if (e.key === 'Escape') {
                    closeSettingsDialog();
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
            
            // ダイアログを表示
            document.body.appendChild(overlay);
            
            // アニメーション開始
            setTimeout(() => {
                overlay.style.opacity = '1';
                dialog.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            return overlay;
        }

        // 設定ダイアログを作成
        function createSettingsDialog() {
            // 選択されたイベントを格納するグローバル変数
            // ローカルストレージから復元を試行
            try {
                const savedEvents = localStorage.getItem('selectedEventsForSchedule');
                if (savedEvents) {
                    window.selectedEventsForSchedule = JSON.parse(savedEvents);
                } else {
                    window.selectedEventsForSchedule = window.selectedEventsForSchedule || [];
                }
            } catch (e) {
                console.warn('ローカルストレージからの読み込みに失敗しました:', e);
                window.selectedEventsForSchedule = window.selectedEventsForSchedule || [];
            }
            // チケットIDを保持するグローバル変数（ローカルストレージから復元）
            try {
                const savedTicketId = localStorage.getItem('savedTicketId');
                window.savedTicketId = savedTicketId !== null ? savedTicketId : (window.savedTicketId || 'HSFVPTPHG4,4C6JQHSEXZ');
            } catch (e) {
                window.savedTicketId = window.savedTicketId || 'HSFVPTPHG4,4C6JQHSEXZ';
            }
            
            // 入場日を保持するグローバル変数（ローカルストレージから復元）
            try {
                const savedEntranceDate = localStorage.getItem('savedEntranceDate');
                window.savedEntranceDate = savedEntranceDate !== null ? savedEntranceDate : new Date().toISOString().split('T')[0];
            } catch (e) {
                window.savedEntranceDate = new Date().toISOString().split('T')[0];
            }
            
            // 現在時刻以降フィルターを保持するグローバル変数（ローカルストレージから復元）
            try {
                const showAfterCurrentTime = localStorage.getItem('showAfterCurrentTime');
                window.showAfterCurrentTime = showAfterCurrentTime !== null ? showAfterCurrentTime === 'true' : (window.showAfterCurrentTime !== undefined ? window.showAfterCurrentTime : true);
            } catch (e) {
                window.showAfterCurrentTime = window.showAfterCurrentTime !== undefined ? window.showAfterCurrentTime : true;
            }
            
            // 取得間隔を保持するグローバル変数（ローカルストレージから復元）
            try {
                const savedInterval = localStorage.getItem('savedInterval');
                window.savedInterval = savedInterval !== null ? parseInt(savedInterval) : (window.savedInterval || 5);
            } catch (e) {
                window.savedInterval = window.savedInterval || 5;
            }
            
            // 自動予約範囲時間を保持するグローバル変数（ローカルストレージから復元）
            try {
                const savedAutoReserveTime = localStorage.getItem('savedAutoReserveTime');
                window.savedAutoReserveTime = savedAutoReserveTime !== null ? savedAutoReserveTime : (window.savedAutoReserveTime || '03:00');
            } catch (e) {
                window.savedAutoReserveTime = window.savedAutoReserveTime || '03:00';
            }
            
            // 自動取得を保持するグローバル変数（ローカルストレージから復元）
            try {
                const autoReload = localStorage.getItem('autoReload');
                window.autoReload = autoReload !== null ? autoReload === 'true' : (window.autoReload !== undefined ? window.autoReload : false);
            } catch (e) {
                window.autoReload = window.autoReload !== undefined ? window.autoReload : false;
            }
            
            // 自動取得タイマーを保持するグローバル変数
            window.autoReloadTimer = window.autoReloadTimer || null;
            // 自動予約の状態を保持するグローバル変数
            window.autoReserveStates = window.autoReserveStates || {};
            
            // 時間スロットを生成（9:00から21:00まで15分間隔）
            function generateTimeSlots() {
                const timeSlots = [];
                let startHour = 9;
                let startMinute = 0;
                
                // 現在時刻以降フィルターがONの場合、開始時刻を現在時刻以降に設定
                if (window.showAfterCurrentTime) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    
                    // 15分単位に切り上げ
                    const roundedMinute = Math.ceil(currentMinute / 15) * 15;
                    
                    if (roundedMinute >= 60) {
                        startHour = Math.max(9, currentHour + 1);
                        startMinute = 0;
                    } else {
                        startHour = Math.max(9, currentHour);
                        startMinute = roundedMinute;
                    }
                    
                    // 21時を超えた場合は空の配列を返す
                    if (startHour > 21) {
                        return [];
                    }
                }
                
                for (let hour = startHour; hour <= 21; hour++) {
                    const minStart = (hour === startHour) ? startMinute : 0;
                    for (let minute = minStart; minute < 60; minute += 15) {
                        if (hour === 21 && minute > 0) break; // 21:00で終了
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        timeSlots.push(timeString);
                    }
                }
                return timeSlots;
            }
            
            // 自動取得機能を開始・停止する関数
            function toggleAutoReload() {
                if (window.autoReload) {
                    // 自動取得を開始
                    startAutoReload();
                } else {
                    // 自動取得を停止
                    stopAutoReload();
                }
            }
            
            function startAutoReload() {
                // 既存のタイマーがあれば停止
                if (window.autoReloadTimer) {
                    clearInterval(window.autoReloadTimer);
                }
                
                // 新しいタイマーを設定
                const interval = (window.savedInterval || 5) * 1000; // 秒をミリ秒に変換
                window.autoReloadTimer = setInterval(async () => {
                    const reloadButton = document.getElementById('reload-schedule');
                    const reloadIcon = document.getElementById('reload-icon');
                    if (reloadButton && reloadIcon) {
                        await executeApiRequests(reloadButton, reloadIcon);
                    }
                }, interval);
            }
            
            function stopAutoReload() {
                if (window.autoReloadTimer) {
                    clearInterval(window.autoReloadTimer);
                    window.autoReloadTimer = null;
                }
            }
            
            // 自動取得関数をグローバルに登録
            window.toggleAutoReload = toggleAutoReload;
            window.startAutoReload = startAutoReload;
            window.stopAutoReload = stopAutoReload;
            
            // 自動予約の切り替え機能
            window.toggleAutoReserve = function(eventIndex, checked) {
                const events = window.selectedEventsForSchedule || [];
                if (eventIndex < events.length) {
                    const eventCode = events[eventIndex].event_code;
                    window.autoReserveStates[eventCode] = checked;
                    console.log(`自動予約 ${events[eventIndex].event_name}: ${checked ? 'ON' : 'OFF'}`);
                }
            };
            
            // テーブルを生成する関数
            function generateScheduleTable() {
                const tableContainer = document.getElementById('event-schedule-table');
                if (!tableContainer) return;
                
                const timeSlots = generateTimeSlots();
                const events = window.selectedEventsForSchedule || [];
                
                if (events.length === 0) {
                    tableContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; font-family: Arial, sans-serif;">イベントが選択されていません</div>';
                    return;
                }
                
                let tableHTML = '<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">';
                
                // ヘッダー行（時間）
                tableHTML += '<thead><tr><th style="border: 1px solid #ddd; padding: 4px; background-color: #f5f5f5; position: sticky; left: 0; z-index: 3; width: 50px; min-width: 50px; font-size: 10px;">自動予約</th><th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; position: sticky; left: 50px; z-index: 2; min-width: 150px;">イベント</th>';
                
                // 現在時刻と自動予約範囲時間を取得
                const now = new Date();
                const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                const autoReserveTime = window.savedAutoReserveTime || '03:00';
                const [autoReserveHours, autoReserveMinutes] = autoReserveTime.split(':').map(Number);
                const autoReserveRangeMinutes = autoReserveHours * 60 + autoReserveMinutes;
                const endTimeMinutes = currentTimeMinutes + autoReserveRangeMinutes;
                
                timeSlots.forEach(time => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const slotTimeMinutes = hours * 60 + minutes;
                    
                    // 現在時刻から自動予約範囲時間内かチェック
                    const isInAutoReserveRange = slotTimeMinutes >= currentTimeMinutes && slotTimeMinutes <= endTimeMinutes;
                    const backgroundColor = isInAutoReserveRange ? '#e3f2fd' : '#f5f5f5'; // 薄い青色に変更
                    
                    tableHTML += `<th style="border: 1px solid #ddd; padding: 4px; background-color: ${backgroundColor}; min-width: 50px; font-size: 10px;">${time}</th>`;
                });
                tableHTML += '</tr></thead>';
                
                // イベント行
                tableHTML += '<tbody>';
                events.forEach((event, eventIndex) => {
                    tableHTML += '<tr>';
                    
                    // 自動予約チェックボックス列（固定列）
                    tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center; background-color: #f9f9f9; position: sticky; left: 0; z-index: 3; width: 50px; min-width: 50px;">
                        <input type="checkbox" id="auto-reserve-${eventIndex}" style="transform: scale(0.8);" 
                               data-event-index="${eventIndex}"
                               onchange="toggleAutoReserve(${eventIndex}, this.checked)">
                    </td>`;
                    
                    // イベント名列（固定列）- リンク化
                    const ticketId = window.savedTicketId || '';
                    const entranceDate = (window.savedEntranceDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
                    const eventUrl = `https://ticket.expo2025.or.jp/event_time/?id=${encodeURIComponent(ticketId)}&event_id=${encodeURIComponent(event.event_code)}&screen_id=108&priority=1&lottery=5&keyword=&event_type=0&reserve_id=&entrance_date=${entranceDate}`;
                    
                    tableHTML += `<td style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9; position: sticky; left: 50px; z-index: 2; font-weight: bold; max-width: 150px; word-wrap: break-word; min-width: 150px;">
                        <div style="font-size: 11px;">
                            <a href="javascript:void(0)" style="color: #007bff; text-decoration: none;" 
                               onmouseover="this.style.textDecoration='underline'" 
                               onmouseout="this.style.textDecoration='none'"
                               onclick="
                                   sessionStorage.setItem('latestPage', '&quot;/event_search&quot;');
                                   sessionStorage.setItem('pageSequenceName', '&quot;/event_time&quot;');
                                   window.open('${eventUrl}', '_self');
                               ">
                                ${event.event_name}
                            </a>
                        </div>
                    </td>`;
                    
                    // 時間スロット列
                    timeSlots.forEach((time, timeIndex) => {
                        const cellId = `cell-${eventIndex}-${timeIndex}`;
                        tableHTML += `<td id="${cellId}" style="border: 1px solid #ddd; padding: 2px; text-align: center; background-color: white;">
                                        <div style="width: 100%; height: 20px;"></div>
                                    </td>`;
                    });
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';
                
                tableContainer.innerHTML = tableHTML;
                
                // 自動予約チェックボックスの状態を復元
                events.forEach((event, eventIndex) => {
                    const checkbox = document.getElementById(`auto-reserve-${eventIndex}`);
                    if (checkbox) {
                        const isChecked = window.autoReserveStates[event.event_code] || false;
                        checkbox.checked = isChecked;
                    }
                });
            }
            
            // 時間を分に変換する関数
            function timeToMinutes(timeStr) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            }

            // APIレスポンスからテーブルを更新する関数
            function updateScheduleTableFromApiResults(results) {
                const timeSlots = generateTimeSlots();
                
                // 各イベントの各時間スロットに対してスケジュールデータを収集
                const cellScheduleData = {}; // cellId -> [timeKeys]のマップ

                results.forEach((result, eventIndex) => {
                    if (result.success && result.data && result.data.event_schedules) {
                        const eventSchedules = result.data.event_schedules;
                        
                        // 各時間スロットに対してチェック
                        timeSlots.forEach((timeSlot, timeIndex) => {
                            const cellId = `cell-${eventIndex}-${timeIndex}`;
                            const slotStartMinutes = timeToMinutes(timeSlot);
                            const slotEndMinutes = slotStartMinutes + 15; // 15分間隔
                            
                            const matchingSchedules = [];
                            
                            // すべてのスケジュールをチェック
                            Object.keys(eventSchedules).forEach(timeKey => {
                                const schedule = eventSchedules[timeKey];
                                const scheduleName = schedule.schedule_name;
                                const startTimeFromName = scheduleName.split('-')[0];
                                const scheduleStartMinutes = timeToMinutes(startTimeFromName);
                                
                                // 時間スロットの範囲内（例：10:00-10:15）にある場合
                                if (scheduleStartMinutes >= slotStartMinutes && scheduleStartMinutes < slotEndMinutes) {
                                    matchingSchedules.push({
                                        timeKey: timeKey,
                                        schedule: schedule,
                                        startTime: startTimeFromName
                                    });
                                }
                            });
                            
                            if (matchingSchedules.length > 0) {
                                // マッチするスケジュールがある場合、セルデータに保存
                                cellScheduleData[cellId] = matchingSchedules;
                                
                                const cell = document.getElementById(cellId);
                                if (cell) {
                                    // 利用可能なスケジュールがあるかチェック（最優先）
                                    const availableSchedules = matchingSchedules.filter(ms => 
                                        ms.schedule.time_status === 0 && ms.schedule.unavailable_reason === 0
                                    );
                                    
                                    // time_status が1かつunavailable_reasonが0のスケジュールをチェック（次優先）
                                    const partiallyAvailableSchedules = matchingSchedules.filter(ms => 
                                        ms.schedule.time_status === 1 && ms.schedule.unavailable_reason === 0
                                    );
                                    
                                    // 優先順位: ○ > △ > ×
                                    if (availableSchedules.length > 0) {
                                        // 利用可能なスケジュールがある場合は青い〇を表示（最優先）
                                        cell.style.backgroundColor = 'white';
                                        const timeKeys = matchingSchedules.map(ms => ms.timeKey);
                                        cell.innerHTML = `<div style="width: 100%; height: 20px; color: #007bff; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="showScheduleKeys('${cellId}')">○</div>`;
                                    } else if (partiallyAvailableSchedules.length > 0) {
                                        // time_status が1かつunavailable_reasonが0の場合は黄色の△を表示（次優先）
                                        cell.style.backgroundColor = 'white';
                                        const timeKeys = matchingSchedules.map(ms => ms.timeKey);
                                        cell.innerHTML = `<div style="width: 100%; height: 20px; color: #ffc107; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="showScheduleKeys('${cellId}')">△</div>`;
                                    } else {
                                        // すべて利用不可の場合は×を表示（最低優先）
                                        cell.style.backgroundColor = '#f8f9fa';
                                        cell.innerHTML = '<div style="width: 100%; height: 20px; color: #6c757d; font-size: 12px; display: flex; align-items: center; justify-content: center;">×</div>';
                                    }
                                }
                            }
                        });
                    }
                });
                
                // セルスケジュールデータをグローバルに保存
                window.cellScheduleData = cellScheduleData;
                
                // 自動予約処理を実行
                executeAutoReservation();
            }
            
            // 自動予約処理を実行する関数
            async function executeAutoReservation() {
                const events = window.selectedEventsForSchedule || [];
                const timeSlots = generateTimeSlots();
                
                // 現在時刻と自動予約範囲時間を取得
                const now = new Date();
                const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                const autoReserveTime = window.savedAutoReserveTime || '03:00';
                const [autoReserveHours, autoReserveMinutes] = autoReserveTime.split(':').map(Number);
                const autoReserveRangeMinutes = autoReserveHours * 60 + autoReserveMinutes;
                const endTimeMinutes = currentTimeMinutes + autoReserveRangeMinutes;
                
                // 自動予約が有効なイベントをチェック
                for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
                    const event = events[eventIndex];
                    const isAutoReserveEnabled = window.autoReserveStates[event.event_code] || false;
                    
                    if (!isAutoReserveEnabled) {
                        continue; // 自動予約が無効な場合はスキップ
                    }
                    
                    console.log(`自動予約処理開始: ${event.event_name}`);
                    
                    // 時間スロットを順番に処理（直列実行）
                    for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
                        const timeSlot = timeSlots[timeIndex];
                        const [hours, minutes] = timeSlot.split(':').map(Number);
                        const slotTimeMinutes = hours * 60 + minutes;
                        
                        // 自動予約範囲内かチェック
                        if (slotTimeMinutes < currentTimeMinutes || slotTimeMinutes > endTimeMinutes) {
                            continue; // 範囲外の場合はスキップ
                        }
                        
                        const cellId = `cell-${eventIndex}-${timeIndex}`;
                        const cell = document.getElementById(cellId);
                        
                        if (!cell) continue;
                        
                        // セルに○または△があるかチェック
                        const cellContent = cell.innerHTML;
                        const hasAvailableSchedule = cellContent.includes('○') || cellContent.includes('△');
                        
                        if (hasAvailableSchedule) {
                            console.log(`自動予約実行: ${event.event_name} - ${timeSlot}`);
                            
                            try {
                                // showScheduleKeys関数を呼び出して予約処理を実行
                                const reservationResult = await executeReservationForAutoReserve(cellId);
                                
                                if (reservationResult.success) {
                                    console.log(`自動予約成功: ${event.event_name} - ${timeSlot}`);
                                    
                                    // 予約成功時は全ての自動予約チェックを外す
                                    clearAllAutoReserveStates();
                                    
                                    // 成功メッセージを表示
                                    alert(`🎉 自動予約が完了しました！\n\nイベント: ${event.event_name}\n時間: ${timeSlot}\n\n全ての自動予約を無効にしました。`);
                                    
                                    return; // 成功したら処理を終了
                                }
                            } catch (error) {
                                console.error(`自動予約エラー: ${event.event_name} - ${timeSlot}`, error);
                            }
                        }
                    }
                }
            }
            
            // 自動予約用の予約実行関数
            async function executeReservationForAutoReserve(cellId) {
                const scheduleData = window.cellScheduleData && window.cellScheduleData[cellId];
                if (!scheduleData || scheduleData.length === 0) {
                    return { success: false, error: 'スケジュールデータが見つかりません' };
                }
                
                // セルIDから eventIndex を取得
                const cellIdParts = cellId.split('-');
                const eventIndex = parseInt(cellIdParts[1]);
                
                // 選択されたイベント情報を取得
                const events = window.selectedEventsForSchedule || [];
                if (eventIndex >= events.length) {
                    return { success: false, error: 'イベント情報が見つかりません' };
                }
                
                const event = events[eventIndex];
                const ticketId = window.savedTicketId || '';
                const entranceDate = (window.savedEntranceDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
                
                if (!ticketId.trim()) {
                    return { success: false, error: 'チケットIDが設定されていません' };
                }
                
                // チケットIDをカンマで分割
                const ticketIds = ticketId.split(',').map(id => id.trim()).filter(id => id);
                
                try {
                    // 各スケジュールに対してPOST API送信
                    for (const sd of scheduleData) {
                        const requestBody = {
                            "ticket_ids": ticketIds,
                            "entrance_date": entranceDate,
                            "start_time": sd.timeKey,
                            "event_code": event.event_code,
                            "registered_channel": "5"
                        };
                        
                        try {
                            const response = await fetch('https://ticket.expo2025.or.jp/api/d/user_event_reservations', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json, text/plain, */*',
                                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                                    'Cache-Control': 'no-cache',
                                    'Dnt': '1',
                                    'Pragma': 'no-cache',
                                    'Priority': 'u=1, i',
                                    'Referer': 'https://ticket.expo2025.or.jp/',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
                                },
                                body: JSON.stringify(requestBody)
                            });
                            
                            // HTTPステータスコード200の場合は成功
                            if (response.status === 200) {
                                return { success: true, response: response };
                            }
                            
                        } catch (error) {
                            console.error('自動予約API送信エラー:', error);
                        }
                    }
                    
                    return { success: false, error: '予約に失敗しました' };
                    
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            
            // 全ての自動予約チェックを外す関数
            function clearAllAutoReserveStates() {
                const events = window.selectedEventsForSchedule || [];
                
                // グローバル状態をクリア
                window.autoReserveStates = {};
                
                // UIのチェックボックスをクリア
                events.forEach((event, eventIndex) => {
                    const checkbox = document.getElementById(`auto-reserve-${eventIndex}`);
                    if (checkbox) {
                        checkbox.checked = false;
                    }
                });
                
                console.log('全ての自動予約チェックを無効にしました');
            }
            
            // スケジュールをクリックしたときの予約API送信関数
            window.showScheduleKeys = async function(cellId) {
                const scheduleData = window.cellScheduleData && window.cellScheduleData[cellId];
                if (!scheduleData || scheduleData.length === 0) {
                    alert('スケジュールデータが見つかりません');
                    return;
                }
                
                // セルIDから eventIndex を取得
                const cellIdParts = cellId.split('-');
                const eventIndex = parseInt(cellIdParts[1]);
                
                // 選択されたイベント情報を取得
                const events = window.selectedEventsForSchedule || [];
                if (eventIndex >= events.length) {
                    alert('イベント情報が見つかりません');
                    return;
                }
                
                const event = events[eventIndex];
                const ticketId = window.savedTicketId || '';
                const entranceDate = (window.savedEntranceDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
                
                if (!ticketId.trim()) {
                    alert('チケットIDが設定されていません。設定ダイアログから入力してください。');
                    return;
                }
                
                // チケットIDをカンマで分割
                const ticketIds = ticketId.split(',').map(id => id.trim()).filter(id => id);
                
                try {
                    // 各スケジュールに対してPOST API送信
                    const promises = scheduleData.map(async (sd, index) => {
                        const requestBody = {
                            "ticket_ids": ticketIds,
                            "entrance_date": entranceDate,
                            "start_time": sd.timeKey,
                            "event_code": event.event_code,
                            "registered_channel": "5"
                        };
                        
                        console.log(`予約API送信 [${index + 1}/${scheduleData.length}]:`, requestBody);
                        
                        try {
                            const response = await fetch('https://ticket.expo2025.or.jp/api/d/user_event_reservations', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json, text/plain, */*',
                                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                                    'Cache-Control': 'no-cache',
                                    'Dnt': '1',
                                    'Pragma': 'no-cache',
                                    'Priority': 'u=1, i',
                                    'Referer': 'https://ticket.expo2025.or.jp/',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
                                },
                                body: JSON.stringify(requestBody)
                            });
                            
                            let responseData;
                            try {
                                responseData = await response.json();
                            } catch (e) {
                                responseData = await response.text();
                            }
                            
                            return {
                                index: index + 1,
                                startTime: sd.startTime,
                                timeKey: sd.timeKey,
                                status: response.status,
                                statusText: response.statusText,
                                success: response.ok,
                                data: responseData,
                                requestBody: requestBody
                            };
                            
                        } catch (error) {
                            return {
                                index: index + 1,
                                startTime: sd.startTime,
                                timeKey: sd.timeKey,
                                status: 'ERROR',
                                statusText: 'Network Error',
                                success: false,
                                error: error.message,
                                requestBody: requestBody
                            };
                        }
                    });
                    
                    // 全てのAPIリクエストの完了を待つ
                    const results = await Promise.all(promises);
                    
                    // 結果をログ形式で表示
                    const successCount = results.filter(r => r.success).length;
                    const errorCount = results.filter(r => !r.success).length;
                    
                    // HTTPステータスコード200の場合のみ予約成功ダイアログを表示
                    const status200Results = results.filter(r => r.status === 200);
                    if (status200Results.length > 0) {
                        // 予約成功ダイアログを表示
                        let successMessage = `🎉 予約が完了しました！\n\n`;
                        successMessage += `成功件数: ${status200Results.length}件\n\n`;
                        
                        status200Results.forEach((result) => {
                            successMessage += `✓ ${result.startTime} (${result.timeKey})\n`;
                            if (result.data && result.data.message) {
                                successMessage += `  ${result.data.message}\n`;
                            }
                        });
                        
                        if (status200Results.length < results.length) {
                            const failedCount = results.length - status200Results.length;
                            successMessage += `\n※ ${failedCount}件の予約に失敗しました。詳細は結果ログをご確認ください。`;
                        }
                        
                        alert(successMessage);
                    }
                    
                    // API結果表示エリアを取得または作成
                    let resultDiv = document.getElementById('api-result');
                    if (!resultDiv) {
                        // 結果表示エリアが見つからない場合は新しく作成
                        resultDiv = document.createElement('div');
                        resultDiv.id = 'api-result';
                        resultDiv.style.cssText = `
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            padding: 10px;
                            margin: 10px;
                            font-family: monospace;
                            font-size: 12px;
                            text-align: left;
                            max-height: 300px;
                            overflow-y: auto;
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 80%;
                            max-width: 800px;
                            z-index: 10003;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        `;
                        document.body.appendChild(resultDiv);
                        
                        // 閉じるボタンを追加
                        const closeButton = document.createElement('button');
                        closeButton.textContent = '×';
                        closeButton.style.cssText = `
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            width: 25px;
                            height: 25px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 14px;
                        `;
                        closeButton.onclick = () => {
                            if (resultDiv.parentNode) {
                                resultDiv.parentNode.removeChild(resultDiv);
                            }
                        };
                        resultDiv.appendChild(closeButton);
                    }
                    
                    // 結果HTML生成（POSTリクエストログ）
                    let resultsHTML = `<div style="color: ${errorCount === 0 ? '#28a745' : '#dc3545'}; font-weight: bold; margin-bottom: 10px;">
                        🔄 予約API（POST）送信結果: ${errorCount === 0 ? '✓ 全て成功' : '⚠ 一部エラー'} (成功: ${successCount}件, エラー: ${errorCount}件)
                    </div>`;
                    
                    results.forEach((result) => {
                        const statusColor = result.success ? '#28a745' : '#dc3545';
                        resultsHTML += `<div style="margin-bottom: 8px; padding: 5px; background-color: white; border-radius: 3px; border-left: 3px solid ${statusColor};">
                            <div style="font-weight: bold; color: #333; margin-bottom: 2px;">
                                [${result.index}] POST ${result.success ? '✓' : '✗'} ${result.startTime} (${result.timeKey}) - ${result.status} ${result.statusText}
                            </div>
                            <div style="font-size: 10px; color: #666; margin-bottom: 3px;">POSTリクエスト:</div>
                            <div style="font-size: 10px; max-height: 60px; overflow-y: auto; background-color: #f8f9fa; padding: 3px; border-radius: 2px; margin-bottom: 3px;">
                                <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${JSON.stringify(result.requestBody, null, 2)}</pre>
                            </div>
                            <div style="font-size: 10px; color: #666; margin-bottom: 3px;">${result.success ? 'レスポンス:' : 'エラー:'}</div>
                            <div style="font-size: 10px; max-height: 80px; overflow-y: auto; background-color: #f8f9fa; padding: 3px; border-radius: 2px;">
                                <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${JSON.stringify(result.data || result.error, null, 2)}</pre>
                            </div>
                        </div>`;
                    });
                    
                    resultDiv.innerHTML = `<div style="padding-right: 30px;">${resultsHTML}</div>`;
                    resultDiv.style.display = 'block';
                    
                } catch (error) {
                    // エラーもログ形式で表示
                    let resultDiv = document.getElementById('api-result');
                    if (!resultDiv) {
                        resultDiv = document.createElement('div');
                        resultDiv.id = 'api-result';
                        resultDiv.style.cssText = `
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            padding: 10px;
                            margin: 10px;
                            font-family: monospace;
                            font-size: 12px;
                            text-align: left;
                            max-height: 300px;
                            overflow-y: auto;
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 80%;
                            max-width: 800px;
                            z-index: 10003;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        `;
                        document.body.appendChild(resultDiv);
                        
                        const closeButton = document.createElement('button');
                        closeButton.textContent = '×';
                        closeButton.style.cssText = `
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            width: 25px;
                            height: 25px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 14px;
                        `;
                        closeButton.onclick = () => {
                            if (resultDiv.parentNode) {
                                resultDiv.parentNode.removeChild(resultDiv);
                            }
                        };
                        resultDiv.appendChild(closeButton);
                    }
                    
                    resultDiv.innerHTML = `<div style="padding-right: 30px;">
                        <div style="color: #dc3545; font-weight: bold; margin-bottom: 5px;">
                            ✗ 予約API（POST）送信でエラーが発生しました
                        </div>
                        <pre style="margin: 0; color: #dc3545; background-color: white; padding: 10px; border-radius: 3px;">${error.message}</pre>
                    </div>`;
                    resultDiv.style.display = 'block';
                }
            };
            
            // API URLを生成する関数
            function generateApiUrls(events) {
                const ticketId = window.savedTicketId || '';
                
                if (!ticketId) {
                    // チケットIDがない場合は生成をスキップ
                    return;
                }
                
                // チケットIDをカンマで分割し、ticket_ids[]パラメータを生成
                const ticketIds = ticketId.split(',').map(id => id.trim()).filter(id => id);
                const ticketParams = ticketIds.map(id => `ticket_ids[]=${encodeURIComponent(id)}`).join('&');
                
                // 選択された入場日を取得、なければ現在日付をYYYYMMDD形式で取得
                let currentDate = window.savedEntranceDate || new Date().toISOString().split('T')[0];
                // YYYY-MM-DD形式からYYYYMMDD形式に変換
                currentDate = currentDate.replace(/-/g, '');
                
                // 各イベント用のURLを生成
                const generatedUrls = [];
                events.forEach(event => {
                    const url = `https://ticket.expo2025.or.jp/api/d/events/${event.event_code}?${ticketParams}&entrance_date=${currentDate}&channel=5`;
                    generatedUrls.push({
                        event_code: event.event_code,
                        event_name: event.event_name,
                        url: url
                    });
                });
                
                // グローバル変数に保存
                window.generatedApiUrls = generatedUrls;
                
                // 設定ダイアログのURL表示エリアを更新
                const generatedUrlsDiv = document.getElementById('generated-urls');
                if (generatedUrlsDiv) {
                    let urlsHTML = '<div style="font-weight: bold; margin-bottom: 10px; color: #28a745;">設定</div>';
                    urlsHTML += `<div style="margin-bottom: 10px; color: #666;">対象イベント数: ${generatedUrls.length}件</div>`;
                    urlsHTML += `<div style="margin-bottom: 10px; color: #666;">チケットID: ${ticketIds.join(', ')}</div>`;
                    urlsHTML += `<div style="margin-bottom: 10px; color: #666;">入場日: ${currentDate}</div>`;
                    /*
                    urlsHTML += '<div style="border-top: 1px solid #ddd; padding-top: 10px;">';
                    
                    generatedUrls.forEach((item, index) => {
                        urlsHTML += `<div style="margin-bottom: 8px; padding: 5px; background-color: white; border-radius: 3px;">
                            <div style="font-weight: bold; color: #333; margin-bottom: 2px;">[${index + 1}] ${item.event_code}</div>
                            <div style="font-size: 10px; color: #666; margin-bottom: 3px;">${item.event_name}</div>
                            <div style="word-break: break-all; color: #007bff;">${item.url}</div>
                        </div>`;
                    });
                    
                    urlsHTML += '</div>';
                    */
                    generatedUrlsDiv.innerHTML = urlsHTML;
                    generatedUrlsDiv.style.display = 'block';
                }
            }
            
            // ダイアログのオーバーレイを作成
            const overlay = document.createElement('div');
            overlay.id = 'settings-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // ダイアログコンテンツを作成
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                background-color: white;
                border-radius: 10px;
                padding: 0;
                min-width: 400px;
                max-width: 90%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
                z-index: 10001;
            `;
            
            // ダイアログヘッダー（ドラッグ可能エリア）を作成
            const dialogHeader = document.createElement('div');
            dialogHeader.style.cssText = `
                background-color: #f8f9fa;
                border-radius: 10px 10px 0 0;
                padding: 15px 20px;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid #dee2e6;
                position: relative;
                flex-shrink: 0;
            `;
            
            // ダイアログボディを作成
            const dialogBody = document.createElement('div');
            dialogBody.style.cssText = `
                padding: 15px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            `;
            
            // ダイアログの内容
            dialogHeader.innerHTML = `
                <h2 style="margin: 0; color: #333; font-family: Arial, sans-serif; text-align: center;">当日予約</h2>
                <button id="close-button" style="
                    position: absolute;
                    top: 50%;
                    right: 15px;
                    transform: translateY(-50%);
                    width: 25px;
                    height: 25px;
                    border: none;
                    border-radius: 50%;
                    background-color: #dc3545;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    z-index: 1;
                ">✕</button>
            `;
            
            dialogBody.innerHTML = `
                    </div>
                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                        <button id="event-select" style="
                            background-color: #17a2b8;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            margin-right: 10px;
                        ">イベント選択</button>
                        <button id="settings-button" style="
                            background-color: #6c757d;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                        ">設定</button>
                    </div>
                    <div style="margin-bottom: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-family: Arial, sans-serif; font-size: 16px;">選択イベントスケジュール</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                            <div id="current-datetime" style="color: #495057; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
                                <!-- 現在日時はJavaScriptで更新 -->
                            </div>
                            <button id="reload-schedule" style="
                                background-color: #28a745;
                                color: white;
                                border: none;
                                padding: 8px;
                                border-radius: 50%;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 36px;
                                height: 36px;
                            ">
                                <svg id="reload-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transition: transform 0.3s ease;">
                                    <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div id="event-schedule-table" style="overflow-x: auto; border: 1px solid #ddd; border-radius: 4px;">
                            <!-- テーブルはJavaScriptで動的に生成 -->
                        </div>
                    </div>
                    <div style="margin-bottom: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                        <div id="generated-urls" style="
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            padding: 10px;
                            margin-bottom: 10px;
                            font-family: monospace;
                            font-size: 11px;
                            text-align: left;
                            max-height: 200px;
                            overflow-y: auto;
                            display: none;
                        "></div>

                        <div id="api-result" style="
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            padding: 10px;
                            margin-top: 10px;
                            font-family: monospace;
                            font-size: 12px;
                            text-align: left;
                            max-height: 150px;
                            overflow-y: auto;
                            display: none;
                        "></div>
                    </div>
            `;
            
            // ダイアログの構造を組み立て
            dialog.appendChild(dialogHeader);
            dialog.appendChild(dialogBody);
            overlay.appendChild(dialog);
            
            // ドラッグ機能を追加
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };
            
            // 背景スクロールを無効化
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // タッチイベントの伝播を防ぐ
            overlay.addEventListener('touchmove', function(e) {
                // ドラッグ中でない場合のみ背景スクロールを防ぐ
                if (!isDragging) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // ダイアログ内のタッチイベントは通常通り動作させる（スクロール可能エリア以外）
            dialog.addEventListener('touchmove', function(e) {
                // ドラッグ中の場合は処理をスキップ
                if (isDragging) {
                    return;
                }
                
                // スクロール可能エリア内の場合は通常のスクロール動作を許可
                const target = e.target;
                const scrollableElement = target.closest('#event-schedule-table, #generated-urls, #api-result');
                if (!scrollableElement) {
                    e.stopPropagation();
                }
            }, { passive: true });
            
            // スクロール可能エリアでのタッチイベントを明示的に処理
            const scrollableAreas = dialog.querySelectorAll('#event-schedule-table, #generated-urls, #api-result');
            scrollableAreas.forEach(area => {
                area.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                }, { passive: true });
                
                area.addEventListener('touchmove', function(e) {
                    e.stopPropagation();
                }, { passive: true });
                
                area.addEventListener('touchend', function(e) {
                    e.stopPropagation();
                }, { passive: true });
            });
            
            // マウスイベント（PC用）
            dialogHeader.addEventListener('mousedown', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
            });
            
            // タッチイベント（スマホ用）
            dialogHeader.addEventListener('touchstart', function(e) {
                // ✕ボタンの場合はドラッグを開始しない
                if (e.target.closest('#close-button')) {
                    return;
                }
                
                isDragging = true;
                const rect = dialog.getBoundingClientRect();
                const touch = e.touches[0];
                dragOffset.x = touch.clientX - rect.left;
                dragOffset.y = touch.clientY - rect.top;
                dialog.style.transition = 'none';
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    const x = e.clientX - dragOffset.x;
                    const y = e.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                }
            });
            
            // タッチムーブイベント（スマホ用）
            document.addEventListener('touchmove', function(e) {
                if (isDragging) {
                    const touch = e.touches[0];
                    const x = touch.clientX - dragOffset.x;
                    const y = touch.clientY - dragOffset.y;
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                    dialog.style.transform = 'none';
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // タッチエンドイベント（スマホ用）
            document.addEventListener('touchend', function() {
                if (isDragging) {
                    isDragging = false;
                    dialog.style.transition = 'transform 0.3s ease';
                }
            });
            
            // テーブル生成関数をグローバルに登録
            window.generateScheduleTableFromSettings = generateScheduleTable;
            // URL生成関数をグローバルに登録
            window.generateApiUrls = generateApiUrls;
            
            // 初期テーブル生成
            setTimeout(() => {
                generateScheduleTable();
                // 初期URL生成（イベントが既に選択されている場合）
                if (window.selectedEventsForSchedule && window.selectedEventsForSchedule.length > 0) {
                    generateApiUrls(window.selectedEventsForSchedule);
                }
                // 現在日時の更新を開始
                updateCurrentDateTime();
                setInterval(updateCurrentDateTime, 1000); // 1秒ごとに更新
                
                // 自動取得が有効な場合は開始
                if (window.autoReload && window.toggleAutoReload) {
                    window.toggleAutoReload();
                }
            }, 100);
            
            // 現在日時を更新する関数
            function updateCurrentDateTime() {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                
                const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
                
                const datetimeElement = document.getElementById('current-datetime');
                if (datetimeElement) {
                    datetimeElement.textContent = formattedDateTime;
                }
            }
            
            // スイッチのクリックイベントを追加（削除予定 - 設定ダイアログに移行）
            const toggleSwitches = dialog.querySelectorAll('.toggle-switch');
            toggleSwitches.forEach(switchElement => {
                switchElement.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    const slider = this.querySelector('.slider');
                    const handle = this.querySelector('.handle');
                    
                    checkbox.checked = !checkbox.checked;
                    
                    if (checkbox.checked) {
                        slider.style.backgroundColor = '#007bff';
                        handle.style.left = '29px';
                    } else {
                        slider.style.backgroundColor = '#ccc';
                        handle.style.left = '3px';
                    }
                });
            });
            
            // 時間フィルタートグルスイッチのクリックイベントを追加（削除予定 - 設定ダイアログに移行）
            const timeFilterToggleSwitches = dialog.querySelectorAll('.time-filter-toggle-switch');
            timeFilterToggleSwitches.forEach(switchElement => {
                switchElement.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    const slider = this.querySelector('.slider');
                    const handle = this.querySelector('.handle');
                    
                    checkbox.checked = !checkbox.checked;
                    window.showAfterCurrentTime = checkbox.checked;
                    
                    if (checkbox.checked) {
                        slider.style.backgroundColor = '#007bff';
                        handle.style.left = '29px';
                    } else {
                        slider.style.backgroundColor = '#ccc';
                        handle.style.left = '3px';
                    }
                    
                    // テーブルを再生成
                    generateScheduleTable();
                });
            });
            
            // クローズイベントを追加
            const closeDialog = function() {
                // 自動取得を停止
                if (window.stopAutoReload) {
                    window.stopAutoReload();
                }
                
                // 背景スクロールを復元
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                
                overlay.style.opacity = '0';
                dialog.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            };
            
            // ボタンイベントを追加
            dialog.querySelector('#event-select').addEventListener('click', function() {
                createEventSelectDialog();
            });
            
            // 設定ボタンのイベントハンドラーを追加
            dialog.querySelector('#settings-button').addEventListener('click', function() {
                createSettingsConfigDialog();
            });
            
            // ✕ボタンのイベントハンドラーを追加
            dialog.querySelector('#close-button').addEventListener('click', function() {
                closeDialog();
            });
            
            // API一括送信処理を共通化した関数
            async function executeApiRequests(buttonElement, iconElement = null) {
                const resultDiv = dialog.querySelector('#api-result');
                const events = window.selectedEventsForSchedule || [];
                const ticketId = window.savedTicketId || '';
                
                // イベントとチケットIDのチェック
                if (events.length === 0) {
                    alert('イベントが選択されていません。まずイベントを選択してください。');
                    return;
                }
                
                if (!ticketId) {
                    alert('チケットIDを設定してください。設定ダイアログから入力してください。');
                    return;
                }
                
                // ボタンを無効化して送信中表示
                buttonElement.disabled = true;
                const originalText = buttonElement.textContent;
                if (buttonElement.id === 'send-api') {
                    buttonElement.textContent = '送信中...';
                }
                buttonElement.style.backgroundColor = '#6c757d';
                
                // リロードアイコンのアニメーション開始（反時計回り）
                if (iconElement) {
                    // アニメーションのキーフレームを動的に追加
                    if (!document.getElementById('spin-keyframes')) {
                        const style = document.createElement('style');
                        style.type = 'text/css';
                        style.id = 'spin-keyframes';
                        style.innerHTML = `
                            @keyframes spin-counterclockwise {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(-360deg); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    iconElement.style.animation = 'spin-counterclockwise 1s linear infinite';
                }
                
                // 結果表示エリアをクリア
                if (resultDiv) {
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = `<div style="color: #17a2b8; font-weight: bold;">URL生成中...</div>`;
                }
                
                try {
                    // チケットIDをカンマで分割し、ticket_ids[]パラメータを生成
                    const ticketIds = ticketId.split(',').map(id => id.trim()).filter(id => id);
                    const ticketParams = ticketIds.map(id => `ticket_ids[]=${encodeURIComponent(id)}`).join('&');
                    
                    // 選択された入場日を取得、なければ現在日付をYYYYMMDD形式で取得
                    let currentDate = window.savedEntranceDate || new Date().toISOString().split('T')[0];
                    // YYYY-MM-DD形式からYYYYMMDD形式に変換
                    currentDate = currentDate.replace(/-/g, '');
                    
                    // 各イベント用のURLを生成
                    const generatedUrls = [];
                    events.forEach(event => {
                        const url = `https://ticket.expo2025.or.jp/api/d/events/${event.event_code}?${ticketParams}&entrance_date=${currentDate}&channel=5`;
                        generatedUrls.push({
                            event_code: event.event_code,
                            event_name: event.event_name,
                            url: url
                        });
                    });
                    
                    // グローバル変数に保存
                    window.generatedApiUrls = generatedUrls;
                    
                    // 生成されたURLを生成URLエリアにも表示
                    const generatedUrlsDiv = dialog.querySelector('#generated-urls');
                    if (generatedUrlsDiv) {
                        let urlsHTML = '<div style="font-weight: bold; margin-bottom: 10px; color: #28a745;">設定</div>';
                        urlsHTML += `<div style="margin-bottom: 10px; color: #666;">対象イベント数: ${generatedUrls.length}件</div>`;
                        urlsHTML += `<div style="margin-bottom: 10px; color: #666;">チケットID: ${ticketIds.join(', ')}</div>`;
                        urlsHTML += `<div style="margin-bottom: 10px; color: #666;">入場日: ${currentDate}</div>`;
                        /*
                        urlsHTML += '<div style="border-top: 1px solid #ddd; padding-top: 10px;">';
                        
                        generatedUrls.forEach((item, index) => {
                            urlsHTML += `<div style="margin-bottom: 8px; padding: 5px; background-color: white; border-radius: 3px;">
                                <div style="font-weight: bold; color: #333; margin-bottom: 2px;">[${index + 1}] ${item.event_code}</div>
                                <div style="font-size: 10px; color: #666; margin-bottom: 3px;">${item.event_name}</div>
                                <div style="word-break: break-all; color: #007bff;">${item.url}</div>
                            </div>`;
                        });
                        
                        urlsHTML += '</div>';
                        */
                        generatedUrlsDiv.innerHTML = urlsHTML;
                        generatedUrlsDiv.style.display = 'block';
                    }
                    
                    // API送信開始
                    if (resultDiv) {
                        resultDiv.innerHTML = `<div style="color: #17a2b8; font-weight: bold;">API一括送信開始... (${generatedUrls.length}件)</div>`;
                    }
                    
                    // 各URLに対して並列API送信
                    const promises = generatedUrls.map(async (item, index) => {
                        try {
                            const response = await fetch(item.url, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json, text/plain, */*',
                                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                                    'Cache-Control': 'no-cache',
                                    'Dnt': '1',
                                    'Pragma': 'no-cache',
                                    'Priority': 'u=1, i',
                                    'Referer': 'https://ticket.expo2025.or.jp/',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
                                }
                            });
                            
                            let data;
                            try {
                                data = await response.json();
                            } catch (e) {
                                data = await response.text();
                            }
                            
                            return {
                                event_code: item.event_code,
                                event_name: item.event_name,
                                status: response.status,
                                statusText: response.statusText,
                                success: response.ok,
                                data: data
                            };
                            
                        } catch (error) {
                            return {
                                event_code: item.event_code,
                                event_name: item.event_name,
                                status: 'ERROR',
                                statusText: 'Network Error',
                                success: false,
                                error: error.message
                            };
                        }
                    });
                    
                    // 全てのAPIリクエストの完了を待つ
                    const results = await Promise.all(promises);
                    
                    // APIレスポンスを使ってテーブルを更新
                    updateScheduleTableFromApiResults(results);
                    
                    // 結果をまとめて表示（GETリクエストのログは表示しない）
                    const successCount = results.filter(r => r.success).length;
                    const errorCount = results.filter(r => !r.success).length;
                    
                    if (resultDiv) {
                        // GETリクエストのログは表示せず、簡潔なステータスのみ表示
                        let resultsHTML = `<div style="color: ${errorCount === 0 ? '#28a745' : '#dc3545'}; font-weight: bold; margin-bottom: 10px;">
                            スケジュール更新完了: ${errorCount === 0 ? '✓ 全て成功' : '⚠ 一部エラー'} (成功: ${successCount}件, エラー: ${errorCount}件)
                        </div>`;
                        
                        // エラーがある場合のみ、エラー詳細を表示
                        if (errorCount > 0) {
                            const errorResults = results.filter(r => !r.success);
                            resultsHTML += `<div style="margin-top: 10px; padding: 5px; background-color: #f8d7da; border-radius: 3px;">
                                <div style="font-weight: bold; color: #721c24; margin-bottom: 5px;">エラー詳細:</div>`;
                            
                            errorResults.forEach((result, index) => {
                                resultsHTML += `<div style="margin-bottom: 5px; font-size: 11px; color: #721c24;">
                                    • ${result.event_code}: ${result.statusText || result.error}
                                </div>`;
                            });
                            
                            resultsHTML += `</div>`;
                        }
                        
                        resultDiv.innerHTML = resultsHTML;
                    }
                    
                } catch (error) {
                    if (resultDiv) {
                        resultDiv.innerHTML = `
                            <div style="color: #dc3545; font-weight: bold; margin-bottom: 5px;">
                                ✗ エラーが発生しました
                            </div>
                            <pre style="margin: 0; color: #dc3545;">${error.message}</pre>
                        `;
                    }
                } finally {
                    // ボタンを再度有効化
                    buttonElement.disabled = false;
                    if (buttonElement.id === 'send-api') {
                        buttonElement.textContent = originalText;
                    }
                    buttonElement.style.backgroundColor = '#28a745';
                    
                    // リロードアイコンのアニメーション停止
                    if (iconElement) {
                        iconElement.style.animation = '';
                    }
                }
            }
            
            // リロードボタンのイベントハンドラーを追加
            dialog.querySelector('#reload-schedule').addEventListener('click', async function() {
                const reloadIcon = dialog.querySelector('#reload-icon');
                await executeApiRequests(this, reloadIcon);
            });
            
            // ✕ボタンのホバーエフェクトを追加
            const closeButton = dialogHeader.querySelector('#close-button');
            closeButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#c82333';
                this.style.transform = 'translateY(-50%) scale(1.1)';
            });
            closeButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#dc3545';
                this.style.transform = 'translateY(-50%) scale(1)';
            });
            
            // ✕ボタンのタッチイベントを追加（スマホ対応）
            closeButton.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
            closeButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeDialog();
            }, { passive: false });

            // オーバーレイクリックで閉じる
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeDialog();
                }
            });
            
            // ESCキーで閉じる
            const escKeyHandler = function(e) {
                if (e.key === 'Escape') {
                    closeDialog();
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
            
            // ダイアログを表示
            document.body.appendChild(overlay);
            
            // アニメーション付きで表示
            setTimeout(() => {
                overlay.style.opacity = '1';
                dialog.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            return overlay;
        }
        
        // 歯車アイコンのフロートボタンを作成
        function createFloatingButton() {
            // ボタン要素を作成
            const floatButton = document.createElement('div');
            floatButton.id = 'floating-gear-button';
            
            // CSS スタイルを設定
            floatButton.style.cssText = `
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 60px;
                height: 60px;
                background-color: #007bff;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                transition: all 0.3s ease;
                user-select: none;
            `;
            
            // 歯車アイコンのSVGを作成
            floatButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l1.86-1.41c.2-.15.25-.42.13-.64l-1.86-3.23c-.12-.22-.39-.3-.61-.22l-2.14.91c-.55-.4-1.17-.73-1.85-.92L15.75 4.5c-.03-.26-.25-.5-.5-.5h-3.5c-.25 0-.47.24-.5.5l-.42 2.24c-.68.19-1.3.52-1.85.92l-2.14-.91c-.22-.08-.49 0-.61.22L4.37 9.48c-.12.22-.07.49.13.64L6.36 12c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-1.86 1.41c-.2.15-.25.42-.13.64l1.86 3.23c.12.22.39.3.61.22l2.14-.91c.55.4 1.17.73 1.85.92l.42 2.24c.03.26.25.5.5.5h3.5c.25 0 .47-.24.5-.5l.42-2.24c.68-.19 1.3-.52 1.85-.92l2.14.91c.22.08.49 0 .61-.22l1.86-3.23c.12-.22.07-.49-.13-.64L19.43 13z" fill="white"/>
                </svg>
            `;
            
            // ホバー効果を追加
            floatButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#0056b3';
                this.style.transform = 'scale(1.1)';
            });
            
            floatButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#007bff';
                this.style.transform = 'scale(1)';
            });
            
            // クリックイベントを追加（ダイアログを表示）
            floatButton.addEventListener('click', function() {
                createSettingsDialog();
            });
            
            // ボタンをページに追加
            document.body.appendChild(floatButton);
        }
        
        // DOMContentLoadedイベントでボタンを作成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createFloatingButton);
        } else {
            createFloatingButton();
        }
    })();