export default async function handler(req, res) {
  try {
    const { default: clientPromise } = await import("../../lib/mongodb");
    const bcrypt = await import("bcryptjs");
    const client = await clientPromise;
    const db = client.db("restaurant");
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });
    const hashedPassword = await bcrypt.default.hash(password, 10);
    await db.collection("restaurants").updateOne({ username: username.toLowerCase() }, { $set: { password: hashedPassword } });
    const updated = await db.collection("restaurants").findOne({ username: username.toLowerCase() });
    const testResult = await bcrypt.default.compare(password, updated.password);
    return res.status(200).json({ success: true, username, testCompare: testResult });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
