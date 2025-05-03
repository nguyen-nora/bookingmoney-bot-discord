# ContinentalMoney Bot

ContinentalMoney là một Discord bot quản lý tiền tệ, booking player, và xếp hạng tài khoản trong server. Bot hỗ trợ các chức năng như chuyển tiền, booking player với xác nhận, và phân quyền rõ ràng giữa admin, user, player.

## Tính năng nổi bật
- Quản lý số dư tài khoản cho từng user
- Chuyển tiền giữa các user
- Booking player với xác nhận bằng nút (button)
- Xếp hạng user và player theo số tiền
- Phân quyền: Admin, User, Player
- Lưu lịch sử giao dịch chi tiết

## Cài đặt
1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd ContinentalMoney
   ```
2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```
3. **Cấu hình biến môi trường:**
   - Tạo file `.env` với nội dung:
     ```env
     DISCORD_TOKEN=your_discord_bot_token
     ADMINID=your_discord_user_id
     ```
4. **Chạy bot:**
   ```bash
   node index.js
   ```

## Hướng dẫn sử dụng
### Các lệnh chính
- `/balance` — Xem số dư của bạn
- `/transfer @user <amount>` — Chuyển tiền cho user khác
- `/history` — Xem lịch sử giao dịch của bạn
- `/transactions @user` — Xem lịch sử giao dịch của user khác (chỉ admin)
- `/userrank` — Xếp hạng user theo số tiền nạp
- `/booking @player <amount>` — Đề nghị booking một player (player phải xác nhận bằng nút)
- `/playerrank` — Xếp hạng player theo số tiền booking nhận được
- `/help` — Xem hướng dẫn các lệnh

### Lệnh cho admin
- `/addad @user` — Thêm admin mới (chỉ main admin)
- `/deposit @user <amount>` — Nạp tiền cho user
- `/showbank @user` — Xem hình ảnh bank của user
- `/setplayer @user` — Đặt user thành player
- `/unsetplayer @user` — Gỡ quyền player

## Quyền hạn
- **Admin:** Quản lý, nạp tiền, xem lịch sử, phân quyền player
- **Player:** Chỉ nhận booking, không được booking user khác
- **User:** Chỉ được booking player, không được booking user.

## Booking Player
- Khi user booking player, player sẽ nhận được thông báo với 2 nút: "Đồng ý" hoặc "Từ chối".
- Chỉ khi player bấm "Đồng ý" thì giao dịch booking mới thực hiện.
- Admin và player không được phép booking player khác.

## Lưu ý
- Bot sử dụng SQLite để lưu trữ dữ liệu, file database sẽ tự động tạo khi chạy bot lần đầu.
- Đảm bảo bot có quyền đọc/ghi tin nhắn và sử dụng interaction (button) trong server Discord.
- Các lệnh cần mention user hoặc player đúng cú pháp.

## Đóng góp & Hỗ trợ
- Nếu gặp lỗi hoặc muốn đóng góp, hãy tạo issue hoặc pull request trên repository.
- Mọi thắc mắc vui lòng liên hệ admin server hoặc người phát triển bot.

---
**ContinentalMoney Bot** — Quản lý tài chính và booking hiện đại cho cộng đồng Discord!
