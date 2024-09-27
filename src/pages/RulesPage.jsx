import { Paper, Box, Typography, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import LoopIcon from '@mui/icons-material/Loop';
import StarIcon from '@mui/icons-material/Star';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TuneIcon from '@mui/icons-material/Tune';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

function RulesPage() {
  return (
    <Paper sx={{my: 2, mx: {md: 'auto', xs: 2}, maxWidth: 700}}>
      <Typography variant='h5' sx={{textAlign: 'center', pt: 2}}>How to play Scrabble?</Typography>

      <Box sx={{p: 2}}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <InfoIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Introduction</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              Classic Scrabble starts with a set of 100 tiles. Common letters like the E appear frequently, and less common letters like the Q and Z appear only once. These less common letters are worth more points to compensate.<br />
              Valid words include words of any part of speech, except for proper nouns, abbreviations, or words requiring hyphens or apostrophes. Keep in mind that there are words that look like proper nouns but are still in the dictionary for other reasons. For example, TEXAS is a valid Scrabble word, not because it’s a state, but because it’s the section of a steamboat that includes the crew’s quarters. 
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SportsEsportsIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Basic Gameplay</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              When the game begins, each player is given seven tiles from the tile bag. The turn order is determined at random.<br />
              If you’re going first, place a word on the board with at least one letter of that word touching the center star. You may play either across or down, as long as you touch the center star. Diagonal words are not permitted. Your word must be at least two letters in length.<br />
              Click “Submit” or hit Enter on the keyboard to submit your word and end your turn.<br />
              Once you play your word, you will be given new tiles from the tile bag to replace the ones you’ve used. Until the very end of the game, when there aren’t enough tiles left, you’ll always be given seven tiles to use.<br />
              The next player will then get a turn to make a move of their own. The game will proceed with players alternating turns until the end of the game.<br />
              All letters played on each individual turn must be placed in only one row or column.<br />
              You may play your letters alongside other letters on the board. In fact, it’s encouraged! But when you do this, ALL of the words formed by your play must be valid Scrabble words.<br />
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StarIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Scoring</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              Scores are automatically calculated when you enter a word. The score of your move is the sum of the letter values in each word formed by your play, plus additional points obtained from placing letters on Premium Squares.<br />
              There are four types of Premium Squares in Classic Scrabble – Double Letter, Triple Letter, Double Word, and Triple Word Scores. The letter bonuses multiply the value of individual letters, and the word bonuses multiple the value of the full word. The center star is a Double Word square.<br />
              Once a Premium Square has been used, it may not be used again by connecting a new word to that square on a later turn. On later turns, the values of letters played on Premium Squares are simply the face value of that letter.<br />
              When you can, forming words that connect two different types of Premium Squares is a great way to rack up points. First, individual letter bonuses are calculated; then, word bonuses are calculated.<br />
              If you form multiple words on one play using the same Premium Square, you get the bonus for each word formed.<br />
              Playing all seven of your tiles on a turn is known as a “bingo” or a “bonus.” You receive 50 bonus points in addition to the regular score of your word!<br />
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CheckBoxOutlineBlankIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Blanks</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              Two of the 100 tiles in Classic Scrabble are “blanks.” You may use them as any letter you wish. This makes them extremely valuable. When playing a blank, you will be shown a pop-up menu to designate which letter you would like the blank to become. The blank remains that same letter for the rest of the game. Blanks are worth zero points regardless of which letter you choose, but their flexibility more than makes up for it.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <LoopIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Swapping Tiles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              If you cannot find a word on your turn, you may use your turn to swap tiles instead. Select “Swap” from the menu and click on the tiles you want to swap. Those tiles will return to the bag, and you’ll receive new tiles in their place. This counts as your turn, scoring zero points, and the game will move on to the next player. But if you have very poor tiles (all vowels, all consonants, etc.), this can sometimes be your best option!<br />
              In Classic Scrabble, this can only be done if 7 or more tiles remain in the bag. In Alternative mode, you may keep swapping until the bag is empty.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <EmojiEventsIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>End of Game</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              In Classic Scrabble, when all of the tiles have been drawn, and one player empties their rack using their last letter(s), the game is over. Players with tiles remaining on their rack will subtract the value of those tiles from their score. This same value will then be added to the score of the player who used up their tiles.<br />
              In Alternative mode, the game is over once the tile bag is empty and all players have passed their turn. The remaining tiles will have no effect on the final scores.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <TuneIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Customization</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              When starting a new game, you can choose between Classic and Alternative modes to determine under what circumstances the game would end, and how the winner is ultimately decided.<br />
              Additionally, you can adjust the size of your rack, so players may have less or more than 7 tiles at a time. 
              If you've created custom boards or tile bags using the app's editors, you can use them instead of the Classic Scrabble settings.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SmartToyOutlinedIcon sx={{mr: 1}}/>
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>Text Generation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>
              Before submitting your move, you can write a short prompt that includes the word you're about to create (the word must be at least 3 letters long). If you're creating multiple words, one of them will be randomly picked. Then, you need to choose the reaction you're aiming to get from the generated text.<br />
              The text is generated by a GPT completion model bot that will attempt to continue your prompt. Therefore, try to keep your prompt simple and logical, and do not end it with a period, question or exclamation mark.<br />
              Once the text is generated, the other players can react to it and you'll score a point for every reaction you were aiming for.<br />
              Reaction scores do not influence the outcome of the game and are intended as a fun side activity while players await their turn.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

    </Paper>
  );
}

export default RulesPage;