"use client";

import MainLayout from "@/app/pages/components/MainLayout";
import PageContainer from "@/app/pages/components/container/PageContainer";
import {
  Grid,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const pageName = "FAQ";

const Faq = () => {
  return (
    <MainLayout>
      <PageContainer
        title={pageName}
        description="Frequently Asked Questions about Hashdle"
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            {/* How to Play */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 3, color: "#02bbbb", fontWeight: 700 }}
              >
                How to Play
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">What is Hashdle?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Hashdle is a fun, Play-to-Earn, skill-based game where you
                    guess a secret five-letter sequence from a 64-letter
                    transaction &quot;Hash&quot; in three or fewer guesses
                    within two minutes.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Is there a demo video?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    Yes! Watch our 2.5-minute demo video to see how Hashdle
                    works:
                    <Box sx={{ mt: 2 }}>
                      <video
                        controls
                        style={{
                          width: "100%",
                          maxWidth: "600px",
                          borderRadius: "8px",
                        }}
                      >
                        <source src="/videos/demo.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How do the color hints work?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    Each guess gives you color-coded feedback:
                    <ul>
                      <li>
                        🟩 <strong>Green</strong>: Right letter in the right
                        place
                      </li>
                      <li>
                        🟧 <strong>Orange</strong>: Right letter but wrong place
                        (Hint Fee = 0.25 Credits each)
                      </li>
                      <li>
                        ⬜️ <strong>White</strong>: Wrong letter (Hint Fee =
                        0.50 Credits each)
                      </li>
                    </ul>
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How long do I have to solve it?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You have <strong>two minutes</strong> from when the game
                    starts to make your guesses. If time runs out, the game
                    expires and you&apos;ll need to click &quot;Settle&quot; to
                    finalize.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    What letters can be in the hash?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    The secret sequence uses hexadecimal characters:{" "}
                    <strong>0-9 and A-F</strong>. All letters are automatically
                    made uppercase.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <hr style={{ marginTop: 40, marginBottom: 40, width: "100%" }} />

            {/* Prizes & Fees */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 3, color: "#02bbbb", fontWeight: 700 }}
              >
                Prizes &amp; Fees
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">How much can I win?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    Your prize depends on which guess you win on:
                    <ul>
                      <li>
                        <strong>Guess 1</strong>: 5 Credits 🟩🟩🟩🟩🟩
                      </li>
                      <li>
                        <strong>Guess 2</strong>: 4 Credits 🟩🟩🟩🟩🟩
                      </li>
                      <li>
                        <strong>Guess 3</strong>: 3 Credits 🟩🟩🟩🟩🟩
                      </li>
                    </ul>
                    The faster you solve it, the bigger the prize!
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">What are Hint Fees?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Every time you get a color hint (orange or white), you pay a
                    small Hint Fee from your escrowed credits:
                    <br />
                    <br />
                    • Orange hints (right letter, wrong place): 0.25 Credits
                    each
                    <br />
                    • White hints (wrong letter): 0.50 Credits each
                    <br />
                    • Green hints (correct): No fee
                    <br />
                    <br />
                    These fees are deducted from your 5 Credit escrow as you
                    play.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How does the escrow work?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    When you start a game, both you (Player) and the Game escrow
                    5 Credits each. Your 5 Credits are used to pay Hint Fees as
                    you play. If you win, you get your remaining Credits back
                    plus the prize from the Game escrow.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <hr style={{ marginTop: 40, marginBottom: 40, width: "100%" }} />

            {/* Game Rules */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 3, color: "#02bbbb", fontWeight: 700 }}
              >
                Game Rules
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    What does &quot;Settle&quot; mean?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You <strong>must click &quot;Settle&quot;</strong> to
                    finalize any game and release escrowed Credits back to your
                    account. This applies whether you win, lose, or let the game
                    expire.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Can I cancel a game without paying fees?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Yes! If you click &quot;Settle&quot; before submitting any
                    guesses and before the game expires, you won&apos;t be
                    charged any fees. Your escrowed Credits will be fully
                    refunded.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    What happens if time runs out?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    If the two-minute timer expires before you solve the puzzle,
                    the game ends. You&apos;ll need to click &quot;Settle&quot;
                    to finalize. Any Hint Fees you paid are kept by the house,
                    and your remaining escrowed Credits are returned. You have to do this before you can start a new game.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Can I play if the prize pool is empty?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    No. The game requires at least 5 Credits in the prize pool
                    to be playable. This ensures there are always Credits
                    available for winners.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <hr style={{ marginTop: 40, marginBottom: 40, width: "100%" }} />

            {/* Credits & Blockchain */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 3, color: "#02bbbb", fontWeight: 700 }}
              >
                Credits &amp; Blockchain
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    What blockchain does Hashdle use?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Hashdle runs on the <strong>Vitruveo blockchain</strong>, a
                    fast and low-cost EVM-compatible network.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How do I add Vitruveo to my wallet?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    If you haven&apos;t added Vitruveo to your wallet yet, you
                    can add it automatically from{" "}
                    <a
                      href="https://chainlist.org/?search=vitruveo"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#02bbbb", textDecoration: "underline" }}
                    >
                      Chainlist
                    </a>
                    , or add it manually with these details:
                    <br />
                    <br />
                    <strong>Network Name:</strong> Vitruveo
                    <br />
                    <strong>Chain ID:</strong> 1490
                    <br />
                    <strong>Currency Symbol:</strong> VTRU
                    <br />
                    <strong>RPC URL:</strong> https://rpc.vitruveo.xyz
                    <br />
                    <strong>Block Explorer:</strong>{" "}
                    https://explorer.vitruveo.net
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">How do I get Credits?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    To get Credits, you need <strong>USDC.pol</strong> tokens on
                    Vitruveo:
                    <ol>
                      <li>Add Vitruveo network to your wallet (see above)</li>
                      <li>
                        Bridge USDC.pol from popular EVM networks at{" "}
                        <a
                          href="https://vitruveo.protousd.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#02bbbb",
                            textDecoration: "underline",
                          }}
                        >
                          https://vitruveo.protousd.com/
                        </a>
                      </li>
                      <li>Connect your wallet to Hashdle</li>
                      <li>
                        Go to the{" "}
                        <a
                          href="/credits"
                          style={{
                            color: "#02bbbb",
                            textDecoration: "underline",
                          }}
                        >
                          Credits page
                        </a>{" "}
                        to deposit USDC.pol and convert to Credits (1:1 ratio,
                        no fees)
                      </li>
                    </ol>
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How do I manage my Credits?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="div">
                    Visit the{" "}
                    <a
                      href="/credits"
                      style={{ color: "#02bbbb", textDecoration: "underline" }}
                    >
                      Credits page
                    </a>{" "}
                    to:
                    <ul>
                      <li>
                        <strong>View balances</strong>: See your USDC.pol and
                        Credit balances
                      </li>
                      <li>
                        <strong>Deposit</strong>: Convert USDC.pol to Credits
                        (1:1, no fees) in multiples of 1
                      </li>
                      <li>
                        <strong>Withdraw</strong>: Convert Credits to USDC.pol
                        (1:1, no fees) - any amount up to your balance
                      </li>
                    </ul>
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Are there any fees for deposits or withdrawals?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    No! Both deposits and withdrawals are{" "}
                    <strong>completely fee-free</strong>. Credits convert 1:1
                    with USDC.pol in both directions. The only cost is the
                    minimal blockchain gas fee (VTRU).
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    What about gas fees (VTRU)?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    If the game detects that you don&apos;t have any VTRU in
                    your account for gas, it automatically sends you a small
                    amount so you can play. No action needed on your part!
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    How many Credits do I need to play?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You must have at least <strong>5 Credits</strong> in your
                    account to start a game. These Credits are escrowed during
                    gameplay and released when you settle.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    Can I withdraw fractional Credits?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Yes! While deposits must be in multiples of 1 Credits, you
                    can withdraw <strong>any amount</strong> up to your total
                    Credit balance, including fractional amounts like 4.5
                    Credits.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <hr style={{ marginTop: 40, marginBottom: 40, width: "100%" }} />

            {/* Support */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{ mb: 3, color: "#02bbbb", fontWeight: 700 }}
              >
                Important Information
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Are actions reversible?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    No.{" "}
                    <strong>
                      All actions are final, irreversible, and non-refundable.
                    </strong>{" "}
                    This is because all game actions are recorded on the
                    blockchain and cannot be undone.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">How do I contact you?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You can email us at{" "}
                    <a
                      href="mailto:hashdlegame@gmail.com"
                      style={{ color: "#02bbbb", textDecoration: "underline" }}
                    >
                      hashdlegame@gmail.com
                    </a>
                    . Please note that we may not be able to reply to all
                    inquiries.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        </Grid>
      </PageContainer>
    </MainLayout>
  );
};

export default Faq;
