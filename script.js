const decisionBtn = document.getElementById('decisionBtn');
const resultBox = document.getElementById('resultBox');
const resultText = document.getElementById('resultText');

const options = ['YES', 'NO'];

decisionBtn.addEventListener('click', () => {
  // Vô hiệu hóa nút trong lúc quay ngẫu nhiên
  decisionBtn.disabled = true;
  resultBox.classList.remove('hidden');
  resultText.className = 'spinning';
  
  let counter = 0;
  const speed = 80; // Tốc độ đổi chữ (ms)
  const duration = 2000; // Thời gian quay (2 giây)

  const interval = setInterval(() => {
    // Đổi chữ liên tục tạo hiệu ứng ngẫu nhiên
    resultText.textContent = options[Math.floor(Math.random() * options.length)];
    counter += speed;

    if (counter >= duration) {
      clearInterval(interval);
      
      // Chốt kết quả cuối cùng
      const finalResult = Math.random() < 0.5 ? 'YES' : 'NO';
      resultText.textContent = finalResult;
      
      // Cập nhật kiểu chữ tương ứng
      if (finalResult === 'YES') {
        resultText.className = 'yes-style';
      } else {
        resultText.className = 'no-style';
      }

      // Kích hoạt lại nút bấm
      decisionBtn.disabled = false;
    }
  }, speed);
});
