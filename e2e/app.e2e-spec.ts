import { YogPage } from './app.po';

describe('yog App', () => {
  let page: YogPage;

  beforeEach(() => {
    page = new YogPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
