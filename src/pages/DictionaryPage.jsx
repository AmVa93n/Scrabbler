import { useEffect, useState } from 'react';
import appService from "../services/app.service";
import { Box, Typography, Grid, Container, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Loading from '../components/Loading/Loading';

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

function DictionaryPage() {
  const [dictionary, setDictionary] = useState([])
  const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false);
  const [filteredWords, setFilteredWords] = useState([]);
  const [currentLetter, setCurrentLetter] = useState('A');
  const [currentSecondLetter, setCurrentSecondLetter] = useState('A');
  const [secondLetterOptions, setSecondLetterOptions] = useState([]);

  useEffect(() => {
    async function init() {
        try {
            const dictionary = await appService.getDictionary()
            setDictionary(dictionary)
            setIsDictionaryLoaded(true);
        } catch (error) {
            const errorDescription = error.response.data.message;
            alert(errorDescription)
        }
    }
    init()
  }, []);

  // Trigger filtering when the dictionary is loaded or when letters change
  useEffect(() => {
    if (isDictionaryLoaded) {
      filterByLetter(currentLetter, currentSecondLetter);
    }
  }, [isDictionaryLoaded, currentLetter, currentSecondLetter]);

  // Filter words based on selected first and second letter
  function filterByLetter(firstLetter, secondLetter) {
    setCurrentLetter(firstLetter);
    setCurrentSecondLetter(secondLetter);

    const filtered = dictionary.filter(
      (word) =>
        word[0].toUpperCase() === firstLetter &&
        word[1]?.toUpperCase() === secondLetter
    );
    setFilteredWords(filtered);

    // Update the second letter options based on the first letter
    const secondLetterSet = new Set();
    dictionary
      .filter((word) => word[0].toUpperCase() === firstLetter)
      .forEach((word) => secondLetterSet.add(word[1]?.toUpperCase()));

    setSecondLetterOptions(Array.from(secondLetterSet).sort());
  }

  // Alphabet Navigation Component (First Letter)
  function AlphabetNavigation({ currentLetter, onLetterClick }) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <ToggleButtonGroup
          value={currentLetter}
          exclusive
          onChange={(e, letter) => letter && onLetterClick(letter)}
          sx={{ flexWrap: 'wrap' }}
        >
          {alphabet.map((letter) => (
            <ToggleButton key={letter} value={letter} sx={{ minWidth: '40px', fontWeight: 'bold' }}>
              {letter}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    );
  }

  // Second Letter Navigation Component
  function SecondLetterNavigation({
    currentLetter,
    currentSecondLetter,
    secondLetterOptions,
    onSecondLetterClick,
  }) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <ToggleButtonGroup
          value={currentSecondLetter}
          exclusive
          onChange={(e, secondLetter) => secondLetter && onSecondLetterClick(secondLetter)}
          sx={{ flexWrap: 'wrap' }}
        >
          {secondLetterOptions.map((secondLetter) => {
            const fullPair = currentLetter + secondLetter; // AA, AB, etc.
            return (
              <ToggleButton key={fullPair} value={secondLetter} sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                {fullPair}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        {/* Alphabet Navigation (First Letter) */}
        <AlphabetNavigation
          currentLetter={currentLetter}
          onLetterClick={(letter) => filterByLetter(letter, 'A')}
        />

        {/* Second Letter Navigation */}
        {secondLetterOptions.length > 0 && (
          <SecondLetterNavigation
            currentLetter={currentLetter}
            currentSecondLetter={currentSecondLetter}
            secondLetterOptions={secondLetterOptions}
            onSecondLetterClick={(secondLetter) =>
              filterByLetter(currentLetter, secondLetter)
            }
          />
        )}

        {/* Word List */}
        <Box sx={{ my: 4 }}>
          {isDictionaryLoaded ? (
            filteredWords.length ? (
              <Grid container spacing={2}>
                {filteredWords.map((word, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {word}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                No words found for {currentLetter}
                {currentSecondLetter !== '' && currentSecondLetter}
              </Typography>
            )
          ) : (<Loading />)}
        </Box>

        {/* Second Letter Navigation at the bottom */}
        {secondLetterOptions.length > 0 && (
          <SecondLetterNavigation
            currentLetter={currentLetter}
            currentSecondLetter={currentSecondLetter}
            secondLetterOptions={secondLetterOptions}
            onSecondLetterClick={(secondLetter) =>
              filterByLetter(currentLetter, secondLetter)
            }
          />
        )}

        {/* Alphabet Navigation at the bottom */}
        <AlphabetNavigation
          currentLetter={currentLetter}
          onLetterClick={(letter) => filterByLetter(letter, 'A')}
        />
      </Paper>
    </Container>
  );
}

export default DictionaryPage;