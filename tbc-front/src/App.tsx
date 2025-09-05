import PaymentButton from "./components/PaymentButton";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>TBC Front - Toss Payments Test</h1>
      <PaymentButton
        orderId="ORD-2025-09-05-0002"
        amount={15000}
        orderName="충전"
        userId={1}
      />
    </div>
  );
}

export default App;
