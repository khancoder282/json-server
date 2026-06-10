Xây dựng hệ thống lưu trữ json server có ui quản lý và cấp api đơn giản

- sử dụng nextjs 15 app route, shacdn, bun runtime
- quản lý auth với NextAuth v5 
- Sử dụng tiếng anh Chuyên nghiệp
- Tận dụng lại các Component, khi tạo mới cũng chia nhỏ component
- Xây dụng riêng các hàm xử lý dữ liệu trên server
- ưu tiên dùng form và action.ts của next để handle
- sử dụng mysql tại root:root@localhost:3303/json-server
- dùng orm dizzle để tạo bảng
- gửi email thì hãy chọn Resend
- Giao diện tốt cho UI của desktop và cả di động

Chức năng:

- Hệ thống cho Đăng ký, sau khi đăng ký đẫn đến trang resend đồng thời gửi email đến người dùng xác nhận, sau khi xác nhận xong sẽ tự động đi đến dashboard,
- Khi đăng nhập nếu chưa verify thì sẽ đi đến trang verify, sau khi xác nhận xong sẽ tự động đi đến dashboard,
- Trang dashboard sẽ hiển thị thông tin của người dùng và nút đăng xuất, menu chức năng
  - json managerment: cho phép tạo mới 1 file json, chỉnh sửa và xoá json, json lưu vào cơ sở dữ liệu có uuid để quản lý, mỗi json có thể để public hoặc private, nếu public thì mọi người có thể truy cập, nếu private thì chỉ người dùng có key có quyền truy cập (sử dụng @monaco-editor/react để xử lý UI)
  - key managent: cho phép tạo mới key và phân quyền cho key gồm: get, put; các key sẽ được lưu trữ trong cơ sở dữ liệu, mỗi key có thể gắn với 1 user và nhiều json của user đó, quyền được áp dụng cho tất cả các json 
  - log management: cho phép xem log của hệ thống, log gồm các thông tin cơ bản như: thời gian, người dùng, hành động, kết quả, ip, user agent, request body, response body; log sẽ được lưu trữ trong cơ sở dữ liệu; log sẽ tự động xoá mỗi tuần 1 lần, hoặc xoá chủ đọng bởi người dùng dùng Bun để tạo cron

- api: cấp api cho mọi người đều truy cập được với các endpoint mà không cần đăng nhập vào hệ thống:
  - GET /api/json/{id}: lấy thông tin của 1 json cụ thể (nếu public thì không cần key, nếu private thì cần key có quyền truy cập)
  - PUT /api/json/{id}: chỉnh sửa 1 json (yêu cầu key có quyên truy cập), có thể gửi một phần cấu trúc, hệ thống tự merge với cấu trúc hiện có