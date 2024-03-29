export const introduceBlockAndSentenceIds = blocks => {
  let sentIdx = 0;
  return blocks.map((block, index) => {
    return {
      ...block,
      blockIdx: index,
      sentences: block.sentences.map(sentence => {
        return {
          text: sentence,
          sentIdx: sentIdx++,
        };
      }),
    };
  });
};

export const getAuthorBlocks = blocks => {
  const authorsListIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text?.indexOf('Author List') > -1
  );
  const authorBlocks = blocks.slice(authorsListIndex + 1);
  return authorBlocks.flatMap(
    ({ sentences: [{ text }], level }, index, blocks) => {
      if (text.startsWith('Author ')) {
        let nextBlockLevel = level + 1;
        let blockIndex = index + 1;
        const affiliationBlocks = [];
        while (nextBlockLevel > level) {
          const nextBlock = blocks[blockIndex];
          if (nextBlock.sentences[0].text === 'Affiliation') {
            affiliationBlocks.push(blocks[blockIndex + 1]);
          }
          nextBlockLevel = nextBlock.level;
          blockIndex++;
        }
        return [
          {
            lastNameBlock: blocks[index + 2],
            firstNameBlock: blocks[index + 4],
            affiliationBlocks,
          },
        ];
      } else {
        return [];
      }
    }
  );
};

export const getAffiliationBlocks = blocks => {
  let serialNo = 1;
  const affiliationBlocks = blocks.flatMap(
    ({ sentences: [{ text }] }, index, blocks) => {
      if (text === 'Affiliation') {
        return [{ ...blocks[index + 1] }];
      } else {
        return [];
      }
    }
  );
  const uniqueAffiliationBlocks = [
    ...new Map(
      affiliationBlocks.map(affiliationBlock => [
        affiliationBlock.sentences[0].text,
        affiliationBlock,
      ])
    ).values(),
  ];
  return uniqueAffiliationBlocks.map(affiliationBlock => ({
    ...affiliationBlock,
    affiliationId: serialNo++,
  }));
};

export const getPmidBlock = blocks => {
  const pmidHeaderIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text === 'Article Id pubmed'
  );
  if (pmidHeaderIndex > -1) {
    return blocks[pmidHeaderIndex + 1];
  }
};

export const getPmcBlock = blocks => {
  const pmcHeaderIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text === 'Article Id pmc'
  );
  if (pmcHeaderIndex > -1) {
    return blocks[pmcHeaderIndex + 1];
  }
};

export const getDoiBlock = blocks => {
  const doiHeaderIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text === 'Article Id doi'
  );

  if (doiHeaderIndex > -1) {
    return blocks[doiHeaderIndex + 1];
  }
};

export const getDatePublishedBlocks = blocks => {
  const datePublishedIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text === 'Pub Date'
  );
  return {
    yearBlock: blocks[datePublishedIndex + 2],
    monthBlock: blocks[datePublishedIndex + 4],
  };
};

export const getJournalTitleBlock = blocks => {
  const journalTitleHeadingIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text === 'Title'
  );
  return blocks[journalTitleHeadingIndex + 1];
};

export const getArticleBodyBlocks = blocks => {
  const abstractListIndex = blocks.findIndex(
    ({ sentences: [{ text }] }) => text?.indexOf('Abstract') > -1
  );
  const articleBodyBlocks = blocks.slice(abstractListIndex + 1);
  const subBlocks = articleBodyBlocks.flatMap(
    ({ sentences: [{ text }] }, index, blocks) => {
      if (text.startsWith('Abstract')) {
        return [
          { headingBlock: blocks[index], descriptionBlock: blocks[index + 1] },
        ];
      } else {
        return [];
      }
    }
  );
  return [
    {
      ...blocks[abstractListIndex],
      blocks: subBlocks,
    },
  ];
};
