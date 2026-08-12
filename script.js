document.addEventListener('DOMContentLoaded', () => {
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultDesc = document.getElementById('resultDesc');
    const btnReset = document.getElementById('btnReset');
    const buttonsStage = document.querySelector('.buttons-stage');

    // Tạo âm thanh phát khi bấm nút 3D (dùng Web Audio API không cần file âm thanh ngoài)
    function playClickSound(isYes) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            // Tần số cao vui tươi hơn cho YES, thấp hơn cho NO
            osc.frequency.setValueAtTime(isYes ? 587.33 : 220, audioCtx.currentTime); // D5 hoặc A3
            if (isYes) {
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            } else {
                osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.15);
            }

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
            // Tự động bỏ qua nếu trình duyệt chặn AudioContext
        }
    }

    // Xử lý khi nhấn nút YES
    btnYes.addEventListener('click', () => {
        playClickSound(true);

        // Bắn pháo hoa Confetti chúc mừng
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#34d399', '#10b981', '#6ee7b7', '#ffffff']
            });
        }

        // Cập nhật thẻ kết quả
        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'Bạn đã chọn YES!';
        resultTitle.style.color = '#34d399';
        resultDesc.textContent = 'Đồng ý thành công! Rất vui vì quyết định của bạn.';

        // Hiển thị kết quả
        resultCard.classList.remove('hidden');
    });

    // Xử lý khi nhấn nút NO
    btnNo.addEventListener('click', () => {
        playClickSound(false);

        // Hiệu ứng rung lắc sân khấu khi chọn NO
        buttonsStage.style.animation = 'none';
        buttonsStage.offsetHeight; // Trigger reflow
        buttonsStage.style.animation = 'shake 0.4s ease';

        // Cập nhật thẻ kết quả
        resultIcon.textContent = '😅';
        resultTitle.textContent = 'Bạn đã chọn NO!';
        resultTitle.style.color = '#fb7185';
        resultDesc.textContent = 'Bạn đã từ chối! Hãy suy nghĩ lại nếu bạn đổi ý nhé.';

        // Hiển thị kết quả
        resultCard.classList.remove('hidden');
    });

    // Nút làm lại
    btnReset.addEventListener('click', () => {
        resultCard.classList.add('hidden');
    });

    // Thêm CSS keyframes rung lắc bằng JS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(styleSheet);
});