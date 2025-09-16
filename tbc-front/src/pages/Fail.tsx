export default function Fail() {
    const query = new URLSearchParams(window.location.search);
    return (
        <div>
            <h2>❌ 결제 실패</h2>
            <p>{query.get("message")}</p>
            <p>{query.get("code")}</p>
        </div>
    );
}
  