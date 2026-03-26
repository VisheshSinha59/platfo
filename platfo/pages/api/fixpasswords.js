export default async function handler(req, res) {
  try {
    const { default: clientPromise } = await import("../../lib/mongodb");
    const client = await clientPromise;
    const db = client.db("restaurant");
    await db.collection("restaurants").updateMany({}, [{ $set: { password: "1234" } }]);
    await db.collection("restaurants").updateOne({ username: "testrest" }, { $set: { password: "123456" } });
    const all = await db.collection("restaurants").find({}).toArray();
    return res.status(200).json({ success: true, passwords: all.map(r => ({ username: r.username, password: r.password })) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
