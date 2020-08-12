import React, { useState, useMemo } from 'react';
import createIrmaSession from '@services/createIrmaSession';
import getGGW from '@services/getGGW';
import content from '@services/content';
import ReactMarkDown from 'react-markdown';
import * as AscLocal from '@components/LocalAsc/LocalAsc';
import { Link, Accordion } from '@datapunt/asc-ui';
import { Alert as AlertIcon } from '@datapunt/asc-assets';
import CredentialSelector, { CredentialSource } from '@components/CredentialSelector/CredentialSelector';
import PageTemplate from '@components/PageTemplate/PageTemplate';
import BreadCrumbs from '@components/BreadCrumbs';
import QRCode from '@components/QRCode/QRCode';
import DemoNotification from '@components/DemoNotification/DemoNotification';
import ExternalLink from '@components/ExternalLink/ExternalLink';
import HeaderImage, { IHeaderImageProps } from '@components/HeaderImage/HeaderImage';
import EmphasisBlock from '@components/EmphasisBlock/EmphasisBlock';
import { Checkmark } from '@datapunt/asc-assets';
import ContentBlock from '@components/ContentBlock/ContentBlock';
import WhyIRMA from '@components/WhyIRMA/WhyIRMA';

export interface IProps {}

const Demo2: React.FC<IProps> = () => {
    const [credentialSource, setCredentialSource] = useState(CredentialSource.DEMO);
    const [isOver18, setIsOver18] = useState<boolean>(false);
    const [isPostcodeInArea, setIsPostcodeInArea] = useState<boolean>(false);
    const [hasResult, setHasResult] = useState<boolean>(false);
    const [wijk, setWijk] = useState<string>('');
    const [ggw, setGgw] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);

    const getSession = async () => {
        const response = await createIrmaSession('demo2', 'irma-qr', credentialSource === CredentialSource.DEMO);
        if (response) {
            setIsOver18(response['over18'] === 'Yes');
            const postcode = response['zipcode'].replace(/ /, '');
            setHasResult(true);
            setHasError(false);

            const ggwResponse = await getGGW(postcode);

            if (ggwResponse) {
                setIsPostcodeInArea(true);
                setWijk(ggwResponse.buurtcombinatieNamen);
                setCode(ggwResponse.ggwCode);
                setGgw(ggwResponse.ggwNaam);
            } else {
                // error flow if location is not in Amsterdam
                setIsPostcodeInArea(false);
            }
        } else {
            setHasError(true);
        }

        window.scrollTo(0, 0);
        return response;
    };

    const headerImg = useMemo((): IHeaderImageProps => {
        const regExp = /\[\]/;

        if (wijk) {
            return {
                filename: code ? `wijken/${code}` : content.images.demo2.headerWithAmsterdam.src,
                alt: code
                    ? content.images.demo2.headerWithWijk.alt.replace(regExp, ggw)
                    : content.images.demo2.headerWithAmsterdam.alt
            };
        } else if (!hasResult) {
            return { filename: content.images.demo2.header.src, alt: content.images.demo2.header.alt };
        } else if (isOver18 && isPostcodeInArea) {
            return {
                filename: content.images.demo2.ageAndPostcodePositive.src,
                alt: content.images.demo2.ageAndPostcodePositive.alt
            };
        } else if (!isOver18 && isPostcodeInArea) {
            return { filename: content.images.demo2.ageNegative.src, alt: content.images.demo2.ageNegative.alt };
        } else if (isOver18 && !isPostcodeInArea) {
            return {
                filename: content.images.demo2.postcodeNegative.src,
                alt: content.images.demo2.postcodeNegative.alt
            };
        } else if (!isOver18 && !isPostcodeInArea) {
            return {
                filename: content.images.demo2.ageAndPostcodeNegative.src,
                alt: content.images.demo2.ageAndPostcodeNegative.alt
            };
        }
    }, [hasResult, wijk, code, ggw, isOver18, isPostcodeInArea]);

    const resultAlert: JSX.Element = useMemo(() => {
        const regExp = /\[\]/;
        if (!hasResult && !hasError) {
            return null;
        } else if (hasError) {
            return (
                <AscLocal.Alert
                    color={AscLocal.AlertColor.ERROR}
                    icon={<AlertIcon />}
                    heading={content.demoErrorAlert.heading}
                    content={content.demoErrorAlert.content}
                />
            );
        } else if (isOver18 && isPostcodeInArea) {
            return (
                <AscLocal.Alert
                    color={AscLocal.AlertColor.SUCCESS}
                    icon={<Checkmark />}
                    heading={content.demo2.proven.alert.title}
                    content={content.demo2.proven.alert.bodyAgeAndPostcodePositive.replace(regExp, wijk)}
                />
            );
        } else if (!isOver18 && isPostcodeInArea) {
            return (
                <AscLocal.Alert
                    color={AscLocal.AlertColor.ERROR}
                    icon={<AlertIcon />}
                    heading={content.demo2.proven.alert.title}
                    content={content.demo2.proven.alert.bodyAgeNegative.replace(regExp, wijk)}
                />
            );
        } else if (isOver18 && !isPostcodeInArea) {
            return (
                <AscLocal.Alert
                    color={AscLocal.AlertColor.ERROR}
                    icon={<AlertIcon />}
                    heading={content.demo2.proven.alert.title}
                    content={content.demo2.proven.alert.bodyPostcodeNegative}
                />
            );
        } else if (!isOver18 && !isPostcodeInArea) {
            return (
                <AscLocal.Alert
                    color={AscLocal.AlertColor.ERROR}
                    icon={<AlertIcon />}
                    heading={content.demo2.proven.alert.title}
                    content={content.demo2.proven.alert.bodyAgeAndPostcodeNegative}
                />
            );
        }
    }, [hasResult, hasError, isOver18, isPostcodeInArea, wijk]);

    return (
        <PageTemplate>
            <ContentBlock>
                <CredentialSelector credentialSource={credentialSource} setCredentialSource={setCredentialSource} />
                {!hasResult && <DemoNotification />}
                <ReactMarkDown
                    source={content.demo2.breadcrumbs}
                    renderers={{ list: BreadCrumbs, listItem: BreadCrumbs.Item }}
                />
                <ReactMarkDown
                    source={content.demo2[hasResult ? 'proven' : 'unproven'].title}
                    renderers={{ heading: AscLocal.H1 }}
                />
                {resultAlert}
            </ContentBlock>
            <HeaderImage filename={headerImg.filename} alt={headerImg.alt} />
            {!hasResult ? (
                <ContentBlock>
                    <ReactMarkDown
                        source={content.demo2.intro}
                        renderers={{ heading: AscLocal.H2, list: AscLocal.UL }}
                    />
                    <AscLocal.AccordionContainer>
                        <Accordion title={content.demo2.why.title}>
                            <ReactMarkDown
                                source={content.demo2.why.body}
                                renderers={{ paragraph: AscLocal.Paragraph, heading: AscLocal.AccordionHeading }}
                            />
                        </Accordion>
                    </AscLocal.AccordionContainer>
                    <QRCode getSession={getSession} label={content.demo2.button} />
                    <ReactMarkDown
                        source={content.downloadIrma}
                        renderers={{ paragraph: AscLocal.Paragraph, link: ExternalLink }}
                    />
                </ContentBlock>
            ) : (
                <AscLocal.Row>
                    <AscLocal.Column span={{ small: 1, medium: 2, big: 6, large: 9, xLarge: 9 }}>
                        <ContentBlock>
                            <ReactMarkDown
                                source={content.noSavePromise}
                                renderers={{
                                    heading: AscLocal.H2,
                                    paragraph: AscLocal.Paragraph,
                                    list: AscLocal.UL,
                                    link: Link
                                }}
                            />
                            <EmphasisBlock>
                                <ReactMarkDown
                                    source={content.demo2.result}
                                    renderers={{
                                        heading: AscLocal.H2,
                                        paragraph: AscLocal.Paragraph,
                                        list: AscLocal.UL,
                                        link: Link
                                    }}
                                />
                            </EmphasisBlock>
                            <ReactMarkDown source={content.callToAction} />
                        </ContentBlock>
                    </AscLocal.Column>
                    <AscLocal.Column span={{ small: 1, medium: 2, big: 6, large: 3, xLarge: 3 }}>
                        <WhyIRMA />
                    </AscLocal.Column>
                </AscLocal.Row>
            )}
        </PageTemplate>
    );
};

export default Demo2;
