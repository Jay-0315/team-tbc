import PaymentButton from "./components/PaymentButton";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>TBC Front - Toss Payments Test</h1>
      <PaymentButton
        orderId={`ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`}
        amount={50000}
        orderName="테스트 결제"
        userId={1}
      />
    </div>
  );
}

export default App;
